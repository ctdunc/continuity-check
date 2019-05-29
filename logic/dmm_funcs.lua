--base lua scripts by Eleanor Graham, see https://github.com/lnor7/automated-continuity

--[[
function to test resistance across multiple channels. 
channel numbers interpreted as (with digit grouped by [])

[slot number][bank number][row number][column number]

Row number is always between 1-8, or A-Z.
Column number is two digits, with columns higher than 99 represented
alphabetically. I.E. 101-> A1. For more on this, read page 5-3 (186) of the 
<Series 3700A System Switch/Multimeter Reference Manual> pub 2018,
specifically the section on Matrix Channel Specifiers.
--]]

--[[
Row usage: Connor's understanding.
Basically, to test a resistor against another, you close one on row 1 (111...),
and the list of others on row 2 (112...). As soon as you close another row 1,
you've closed that path through the circuit.
--]]

function resistance_test(ch1, ch2_list)
    --sets up resistor to test resistance of total parallell circuit against.
    resistor = "11156,11254"
    channel.close(resistor)

    channel.close("111"..ch1)
    for i = 1, #ch2_list do
    	channel.close("112"..ch2_list[i])
    end

    --buffer to store output of single measurement
    buf = dmm.makebuffer(1)
     
    --unsure if this delay is necessary? Might create a bottleneck. BRUNO: how hard push?
    delay(0.3)
    dmm.measure(buf)

    for i=1,#ch2_list do
    	channel.open("112"..ch2_list[i])
    end
    channel.open("111"..ch1)
    channel.open(resistor)

    --reads output of resistance measurement into number
    res_measured = tonumber(buf[1])
    
    --converts total parallel measurement to measurement of test subjects.
    res_test_only = 1/((1/res_measured)-(1/res_cal))

    --IMPORTANT: note this outputs a total resistance of many tests.
    --Account for this on the server side testing, otherwise,
    --you'll have false failures and sucesses.
    print(res_test_only.." Ohm")
end
    
--measure resistance between two channels
function single_test(ch1,ch2)
    pair = "111"..ch1..",112"..ch2
    buf = dmm.makebuffer(1)

    channel.close(pair)

    delay(0.3)
    dmm.measure(buf)

    channel.open(pair)

    print(buf[1].." Ohm")
end

reset()
dmm.func = "twowireohms"
dmm.autodelay = 0

--calibrate resistor
channel.close("11156,11254")
delay(wait_val)
res_buf = dmm.makebuffer(1)
dmm.measure(res_buf)
res_cal = tonumber(res_buf[1])
channel.open("11156,11254")

