import numpy as np
import time
import json
from collections import Counter
from logic.dmm_interface import dmm_interface

MSR = 'KEY_MEASUREMENT'
MSG = 'KEY_MESSAGE'
ERR = 'KEY_ERROR'

def perform_check(expected_values,channel_naming,dmm_ip=''):
    try:
        dmm = dmm_interface(dmm_ip)
    except:
        pass
    expected_values=np.array(expected_values)
    yield_data = lambda key,value,n: {'key':key, 'value':value, 'rownum': n}
    channel_naming=np.array(channel_naming)
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
        #naming done below for code legibility
        mini,maxi,matrix1,matrix2 = row[5],row[6],row[7],row[8]
        
        # TODO: perform connected tests
        # measurement = dmm.test_individual(matrix1,matrix2)
        measurement = 1
        if float(mini) < measurement < float(maxi):
            success = 1
        else:
            success = 0
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
    mini = max([float(i) for i in minima.flatten()])
    
    #perform check
    # measurement = dmm.test_parallell(s1,s2_list)
    measurement = 4e10 
    if measurement > mini:
        success = 1
        return_rows = [np.hstack([r,[success,measurement]]) for r in rows]
        yield return_rows, len(return_rows)
        # if measurement fails, we break down into binary search to find errant connections
    else:
       rows_split = np.array_split(rows,2)
       for c in rows_split:
           if len(c)>1:
               yield from parallell_disconnect(s1,c,dmm)
           elif len(c)==1:
               c = c[0]
               #measurement = dmm.test_individual(c[7],c[8])
               measurement = 1
               if mini < measurement:
                   success = 1
               else: 
                   success = 0
               return_row = np.hstack([c[:6],[success,measurement]])
               yield return_row, 1
           else:
               continue
