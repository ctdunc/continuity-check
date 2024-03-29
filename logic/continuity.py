import numpy as np
import random as rand
import time
import json
from collections import Counter
from logic.dmm_interface import dmm_interface

MSR = 'KEY_MEASUREMENT'
MSG = 'KEY_MESSAGE'
ERR = 'KEY_ERROR'

def perform_check(expected_values,channel_naming,dmm_ip=''):
    try:
        dmm = dmm_interface()
    except:
        pass
    expected_values=np.array(expected_values)
    yield_data = lambda key,value,n: {'key':key, 'value':value, 'rownum': n}
    channel_naming=np.array(channel_naming)
    print(channel_naming)
    tests = []
    for r in range(len(expected_values)):
        row = expected_values[r]
        try:
            sig1_matrix = channel_naming[
                (channel_naming[:,3]==row[0])
                &
                (channel_naming[:,4]==row[1])][0,0]
            sig2_matrix = channel_naming[
                (channel_naming[:,3]==row[2])
                & 
                (channel_naming[:,4]==row[3])][0,0]
            addrow = np.hstack([row,[sig1_matrix,sig2_matrix]])
            tests.append(addrow)
        except IndexError as e:
            raise

    tests = np.array(tests)

    #split tests into arrays of disconnected and connected tests
    tests_disconnect = tests[np.where(tests[:,4]=='0')]
    tests_connect = tests[np.where(tests[:,4]=='1')]

    # perform connected tests
    for row in tests_connect:
        mini, maxi, matrix1, matrix2 = float(row[5]), float(row[6]), row[7], row[8]

        # TODO: Change to close multiple channels at once, has Toshin tested this?
        # Otherwise, we just need to come up with a cute way to do this fast.
        measurement = rand.uniform(mini-diff,maxi+diff)
        success = 0
        if mini < measurement < maxi:
            success = 1
        return_row = np.hstack([row,[success,measurement]])
        yield yield_data(key=MSR,value=return_row.tolist(),n=1)

        
    # perform disconnected tests
    # first, group signals by frequency (so that we find more errors per test)
    sig_by_freq = Counter(np.array([tests_disconnect[:,8],tests_disconnect[:,7]]).flatten())
    for s1 in sig_by_freq:
        #for more frequent signals (s1), find every node it *isn't* connected to, and test them against s1 all at once
        indices = np.hstack([np.where(tests_disconnect[:,7]==s1),np.where(tests_disconnect[:,8]==s1)])

        if not indices.size:
            # means there are no tests in the array for s1, so continue loop
            # (I would use break here, but use continue in case there are more tests left for different signals)
            continue 
        rows = tests_disconnect[indices][0]
        for return_row,n in parallell_disconnect(s1,rows,dmm=''):
            yield yield_data(key=MSR,value=[r.tolist() for r in return_row],n=n) 
        tests_disconnect = np.delete(tests_disconnect,indices,axis=0)

def parallell_disconnect(s1,rows,dmm):
    s1_first = rows[np.where(rows[:,7]==s1)]
    s1_second = rows[np.where(rows[:,8]==s1)]
    s2_list = np.hstack([s1_first[:,8],s1_second[:,7]])
    minima = rows[:,5]
    mini = min([float(i) for i in minima.flatten()])
    
    #perform check
    # measurement = dmm.test_parallell(s1,s2_list)
    measurement = 0
    success = 0
    if measurement > mini:
        success = 1
        return_rows = [np.hstack([r,[success,measurement]]) for r in rows]
        yield return_rows, len(return_rows)
        # if measurement fails, we break down into binary search to find errant connections
    else:
       rows_split = np.array_split(rows,2)
       for c in rows_split:
           success = 0
           if len(c)>1:
               yield from parallell_disconnect(s1,c,dmm)
           elif len(c)==1:
               c = c[0]
               measurement = dmm.measure_R(c[7],c[8])
               print([mini,measurement])
               if mini < measurement:
                   success = 1
               return_row = np.hstack([c,[success,measurement]])
               yield return_row, 1
           else:
               continue
