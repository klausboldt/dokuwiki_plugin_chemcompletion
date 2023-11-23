#!/usr/bin/awk -f

BEGIN {
    while (getline < "chemlist_completion.database") {
	    id = tolower($1);
        molarmass[id] = $2;
        density[id] = $3;
    }
}

{
    result = "";
    while (match($0, /[-a-zA-Z0-9,'()_₁₂₃₄₅₆₇₈₉₀]+[[:blank:]]*\(([0-9.]+[[:blank:]]*(µ|u|m)?([glLM]|mol|mol\/[lL]|g\/mol|g\/m[lL]))+(,[[:blank:]]*[0-9.]+[[:blank:]]*(µ|u|m)?([glLM]|mol|mol\/[lL]|g\/mol|g\/m[lL]))*\)/)) {
        beginning=substr($0, 1, RSTART-1);
        pattern=substr($0, RSTART, RLENGTH);
        ending=substr($0, RSTART + RLENGTH);
        # Insert missing spaces after commas
        while (match(pattern, /,[0-9]/))
            pattern = substr(pattern, 0, RSTART) " " substr(pattern, RSTART + 1, length(pattern));
        # Insert missing spaces between values and units
        while (match(pattern, /[0-9][µumglLM]/))
            pattern = substr(pattern, 0, RSTART) " " substr(pattern, RSTART + 1, length(pattern));
        z = split(pattern, compound, " ");
        name = compound[1];
        gsub(/_/, " ", name);
	    id = tolower(compound[1]);
        for (i = 2; i <= z; i++)
            gsub(/[\(\),]/, "", compound[i]);
        
        # Collect all given parameters
        for (i = 2; i <= z; i += 2) {
            # Split parameters if no space is inserted between number and unit
            if (match(compound[i], /([0-9.]+[µum]?([glLM]|mol|mol\/[lL]|g\/mol|g\/m[lL]))+/)) {
                compound[i+1] = compound[i];
                gsub(/[[:alpha:]\/]/, "", compound[i]);
                gsub(/[[:digit:].]/, "", compound[i+1]);
            }
            if (match(compound[i+1], /m([glLM]|mol|mol\/[lL]|g\/mol|g\/m[lL])/)) {
                compound[i] *= 1e-3;
                compound[i+1]=substr(compound[i+1], 2);
            }
            if (match(compound[i+1], /u([glLM]|mol|mol\/[lL]|g\/mol|g\/m[lL])/)) {
                compound[i] *= 1e-6;
                compound[i+1]=substr(compound[i+1], 2);
            }
            if (match(compound[i+1], /µ([glLM]|mol|mol\/[lL]|g\/mol|g\/m[lL])/)) {
                compound[i] *= 1e-6;
                compound[i+1]=substr(compound[i+1], 3); # µ is a UTF-8 character 
            }
            if (compound[i+1] == "mol") amount[id] = compound[i];
            if (compound[i+1] == "g") mass[id] = compound[i];
            if (compound[i+1] == "l" || compound[i+1] == "L") volume[id] = compound[i];
            if (compound[i+1] == "mol/l" || compound[i+1] == "mol/L" || compound[i+1] == "M") concentration[id] = compound[i];
            if (compound[i+1] == "g/mol") molarmass[id] = compound[i];
            if (compound[i+1] == "g/ml" || compound[i+1] == "g/mL") density[id] = compound[i];
            if (i == 2) firstUnitInList = compound[i+1];
        }

        # Values may be contradictory, i.e. "compound (x g, y ml)" with non-matching values
        # If it can be verified that the values don't match (i.e., molar mass and/or density is known),
        # treat the first listed as correct and replace the other values
        if (firstUnitInList == "g") {
            if (density[id])
                if (volume[id] != mass[id] / density[id]) volume[id] = "";
            if (molarmass[id])
                if (amount[id] != mass[id] / molarmass[id]) amount[id] = "";
        } else if (firstUnitInList == "l") {
            if (molarmass[id])
                if (mass[id] != amount[id] * molarmass[id]) mass[id] = "";
            if (molarmass[id])
                if (amount[id] != mass[id] / molarmass[id]) amount[id] = "";
        } else if (firstUnitInList == "mol") {
            if (molarmass[id])
                if (mass[id] != amount[id] * molarmass[id]) mass[id] = "";
            if (density[id])
                if (volume[id] != mass[id] / density[id]) volume[id] = "";
        }
    
        # Complete the list using the known parameters
        if (!mass[id]) {
            if (molarmass[id] && amount[id]) { 
                mass[id] = amount[id] * molarmass[id];
            } else if (density[id] && volume[id]) { 
                mass[id] = density[id] * volume[id];
            }
        }
        if (!amount[id]) {
            if (concentration[id] && volume[id]) {
                amount[id] = concentration[id] * volume[id];
            } else if (molarmass[id] && mass[id]) {
                amount[id] = mass[id] / molarmass[id];
            }
        }
        if (!volume[id]) {
            if (density[id] && mass[id]) {
                volume[id] = mass[id] / density[id];
            }
        }
    
        # Optimize units and account for precision
        if (mass[id]) {
            if (mass[id] < 0.001) {
                mass[id] = mass[id] * 1e6;
                massunit[id] = "µg";
            } else if (mass[id] < 1) {
                mass[id] = mass[id] * 1e3;
                massunit[id] = "mg";
            } else {
                massunit[id] = "g";
            }
        }
        if (volume[id])  {
            if (volume[id] < 0.001) {
                volume[id] = volume[id] * 1e6;
                volumeunit[id] = "µl";
            } else if (volume[id] < 1) {
                volume[id] = volume[id] * 1e3;
                volumeunit[id] = "ml";
            } else {
                volumeunit[id] = "l";
            }
        }
        if (amount[id]) {
            if (amount[id] < 0.001) {
		        amount[id] = amount[id] * 1e6;
                amountunit[id] = "µmol";
            } else if (amount[id] < 1) {
		        amount[id] = amount[id] * 1e3;
                amountunit[id] = "mmol";
            } else {
                amountunit[id] = "mol";
            }
        }
        if (concentration[id]) {
            if (concentration[id] < 0.001)
		        concentration[id] = sprintf("%.3g µM", concentration[id] * 1e6);
            else if (concentration[id] < 1)
                concentration[id] = sprintf("%.3g mM", concentration[id] * 1e3);
            else
                concentration[id] = sprintf("%.3g M", concentration[id]);
        }
        if (molarmass[id]) molarmass[id] = sprintf("%.3g g/mol", molarmass[id]);
        if (density[id]) density[id] = sprintf("%.3g g/ml", density[id]);
        # Determine the number of significant digits
        siginificantDigits[id] = 3;
       # precisionarray[0] = mass[id];
       # precisionarray[1] = volume[id];
       # precisionarray[2] = amount[id];
       # for (n in precisionarray) {
       #     if (precisionarray[n]) {
       #         temp = precisionarray[n];
       #         sub(/^[0\.]*/, "", temp);                        # remove leading zeros and decimal point for n < 1
       #         if (temp ~ /[0-9]\.[0-9]/) sub(/0+$/, "", temp); # remove trailing zeros
       #         sub(/\./, "", temp);                             # remove the decimal point
       #         precision = length(temp);
       #         print precisionarray[n] " to " temp " (" precision ")";
       #         if (siginificantDigits[id] > precision && precision > 0) siginificantDigits[id] = precision;
       #     }
       # }
       # print "significant digits = " siginificantDigits[id];
        formatstring = sprintf("%%.%dg %s", siginificantDigits[id], massunit[id]);
        if (mass[id]) mass[id] = sprintf(formatstring, mass[id]);
        formatstring = sprintf("%%.%dg %s", siginificantDigits[id], volumeunit[id]);
        if (volume[id]) volume[id] = sprintf(formatstring, volume[id]);
        formatstring = sprintf("%%.%dg %s", siginificantDigits[id], amountunit[id]);
        if (amount[id]) amount[id] = sprintf(formatstring, amount[id]);
        
        # Concatenate the replacement string in a logical order:
        # Case 1: pure compound (liquid or solid) with mass, molar amount and (possibly) volume
        # Case 2: solution with volume, concentration, molar amount and mass of solute
        output="";
        if (!concentration[id]) {
            if (mass[id]) output = output mass[id];
            if (amount[id]) {
                if (output) output = output ", "; 
                output = output amount[id];
            }
            if (volume[id]) {
                if (output) output = output ", ";
                output = output volume[id];
            }
        } else {
            if (volume[id]) output = output volume[id];
            if (concentration[id]) {
                if (output) output = output ", ";
                output = output concentration[id];
            }
            if (amount[id]) {
                if (output) output = output ", "; 
                output = output amount[id];
            }
            if (mass[id]) {
                if (output) output = output ", "; 
                output = output mass[id];
            }
        }
        if (molarmass[id]) {
            if (output) output = output ", ";
            output = output "M = " molarmass[id];
        }
        if (density[id]) {
            if (output) output = output ", "; 
            output = output "ρ = " density[id];
        }
        output = name " (" output ")";
	result = result beginning output;
        $0 = ending;
    }
    if (result == "")
        result = $0;
    else
        result = result ending;
    print result;
}
