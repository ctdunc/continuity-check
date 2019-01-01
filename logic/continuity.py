import numpy as np
import time
import json
from collections import Counter
from logic.dmm_interface import dmm_interface

def perform_check(expected_values,channel_naming,dmm_ip=''):

    try:
        dmm = dmm_interface(dmm_ip)
    except:
        pass
    expected_values=np.array(expected_values)
    channel_naming=np.array(channel_naming)
    yield_data = lambda key,value: {'key':key, 'value':value}
    tests = []
    r = 0
    deleted=0
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
        except IndexError:
            continue
    tests = np.array(tests)
    #split tests into arrays of disconnected and connected tests
    tests_disconnect = tests[np.where(tests[:,4]=='0')]
    tests_connect = tests[np.where(tests[:,4]=='1')]
   
    # perform connected tests
    for row in tests_connect:
        #naming done below for code legibility
        ch1,s1,ch2,s2,continuity,mini,maxi,matrix1,matrix2=row[0],row[1],row[2],row[3],row[4],row[5],row[6],row[7],row[8]
        
    # perform disconnected tests
    # first, group signals by frequency (so that we find more errors per test)
    sig_by_freq = Counter(np.array([tests_disconnect[:,8],tests_disconnect[:,7]]).flatten())
    for s1 in sig_by_freq:
        s1_first = tests_disconnect[np.where(tests_disconnect[:,7]==s1)]
        s1_second = tests_disconnect[np.where(tests_disconnect[:,8]==s1)]

        s2_list = np.array([s1_first[:,8],s1_second[:,7]]).flatten()
        print(s2_list)
    return 0

    
    

