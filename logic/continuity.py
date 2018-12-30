import numpy as np
from logic.dmm_interface import dmm_interface
import time
import json

def perform_check(expected_values,channel_naming,dmm_ip=''):
    # TODO: re-add dmm interface after testing is complete
    expected_values=np.array(expected_values)
    channel_naming=np.array(channel_naming)
    tests = []
    r = 0
    deleted=0
    toremove = []
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
            if(sig1_matrix and sig2_matrix):
                addrow = np.hstack([row,[sig1_matrix,sig2_matrix]])
                tests.append(addrow)
            else:
                toremove.append(r) 
                continue
        except IndexError:
            toremove.append(r)
            continue
    tests = np.array(tests)
    print(tests)
    disconnect = tests[np.where(tests[:,4]=='0')]
    connect = tests[np.where(tests[:,4]=='1')]
    return 0
    
    

