# dokuwiki_plugin_chemcompletion
Plugin for DokuWiki that completes text for weighed-in chemicals (mass, volume, amount)

The plugin adds a toolar button to the DokuWiki editor that takes a selected text, parses it through an AWK script, looks for a description of weighed-in chemicals, and returns a completed list of mass, volume, and amount.

The input needs to be of the form

```
name_of_a_chemical (mass unit, volume unit, amount unit, ...)
```

in which all quantities have a numerical value and a unit. These can be `g`, `mg`, or `µg` for mass, `l`, `L`, `ml`, `mL`, `µl`, or `µL` for volume, `mol`, `mmol`, or `µmol` for amount, `g/mol`, `mg/mol`, or `µg/mol` for molar mass, and `g/ml` or `g/mL` for density, and `mol/l` or `mol/L` for concentration.

The plugin completes the list from the given values. Additionally, it checks a database file for a match of the chemical's name and values for molar mass and density.

If no match is found, the plugin returns the original text unchanged.
