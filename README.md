# dokuwiki_plugin_chemcompletion
Plugin for DokuWiki that completes text for weighed-in chemicals (mass, volume, amount)

The plugin adds a toolar button to the DokuWiki editor that takes a selected text, parses it through an AWK script, looks for a description of weighed-in chemicals, and returns a completed list of mass, volume, and amount.

The input needs to be of the form

```
[value unit ] name_of_a_chemical [(mass unit, [volume unit, amount unit, ...])]
```

in which all quantities have a numerical value and a unit. These can be `g`, `mg`, or `µg` for mass, `l`, `L`, `ml`, `mL`, `µl`, or `µL` for volume, `mol`, `mmol`, or `µmol` for amount, `g/mol`, `mg/mol`, or `µg/mol` for molar mass, and `g/ml` or `g/mL` for density, and `mol/l` or `mol/L` for concentration.

The plugin completes the list from the given values. Additionally, it checks a database file for a match of the chemical's name and values for molar mass and density.

For example, `5 g NaOH (40 g/mol)` returns `5 g NaOH (125 mmol, M = 40 g/mol)`, `Ethanol (4 ml, 46.08 g/mol, 0.79 g/ml)` returns `Ethanol (3.16 mg, 68.5 µmol, 4 ml, M = 46.1 g/mol, ρ = 0.789 g/ml)`, and `1 ml Glucose (0.75 mol/l)` returns `1 ml Glucose (750 mM, 750 µmol)`.

The database file contains three columns separated by blanks: compound name, molar mass in g/mol, and (optionally) density in g/ml, e.g., `Ethanol 46.1 0.789`. With this line in the database, the string `4 ml Ethanol` will yield the same line as above. The name is not case sensitive and underscores are replaced by blanks. Synonyms for a chemical can be added by repeating an entry with a different name, but the same values.

If no match is found, the plugin returns the original text unchanged.
