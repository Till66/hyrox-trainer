/* ==========================================================================
   HYROX station data
      Official race order: SkiErg, Sled Push, Sled Pull, Burpee Broad Jumps,
         Rowing, Farmers Carry, Sandbag Lunges, Wall Balls — each preceded by a
            1km run. Source: hyrox.com / official weight standards (Open + Pro).
               ========================================================================== */

               const RUN_DISTANCE_LABEL = "1 km Lauf";

               // inputType: "weightTime" (weight in kg + time) or "levelTime" (level 1-10 + time)
               const STATIONS = [
                 {
                     id: "skierg",
                         name: "SkiErg",
                             icon: "\u{1F3BF}",
                                 distanceLabel: "1000 m",
                                     inputType: "levelTime",
                                         hint: "Stufe: Women Open 5 · Women Pro/Men Open 6 · Men Pro 7"
                                           },
                                             {
                                                 id: "sledpush",
                                                     name: "Sled Push",
                                                         icon: "\u{1F6F7}",
                                                             distanceLabel: "50 m",
                                                                 inputType: "weightTime",
                                                                     hint: "Richtwerte: Women 102/152 kg · Men 152/202 kg (Open/Pro)"
                                                                       },
                                                                         {
                                                                             id: "sledpull",
                                                                                 name: "Sled Pull",
                                                                                     icon: "\u{1F517}",
                                                                                         distanceLabel: "50 m",
                                                                                             inputType: "weightTime",
                                                                                                 hint: "Richtwerte: Women 78/103 kg · Men 103/153 kg (Open/Pro)"
                                                                                                   },
                                                                                                     {
                                                                                                         id: "burpee",
                                                                                                             name: "Burpee Broad Jumps",
                                                                                                                 icon: "\u{1F938}",
                                                                                                                     distanceLabel: "80 m",
                                                                                                                         inputType: "weightTime",
                                                                                                                             weightOptional: true,
                                                                                                                                 hint: "Normalerweise Körpergewicht – Zusatzgewicht optional"
                                                                                                                                   },
                                                                                                                                     {
                                                                                                                                         id: "row",
                                                                                                                                             name: "Rudern",
                                                                                                                                                 icon: "\u{1F6A3}",
                                                                                                                                                     distanceLabel: "1000 m",
                                                                                                                                                         inputType: "levelTime",
                                                                                                                                                             hint: "Stufe: Women Open 5 · Women Pro/Men Open 6 · Men Pro 7"
                                                                                                                                                               },
                                                                                                                                                                 {
                                                                                                                                                                     id: "farmers",
                                                                                                                                                                         name: "Farmers Carry",
                                                                                                                                                                             icon: "\u{1F4AA}",
                                                                                                                                                                                 distanceLabel: "200 m",
                                                                                                                                                                                     inputType: "weightTime",
                                                                                                                                                                                         hint: "Richtwerte: Women 32/48 kg · Men 48/64 kg gesamt (Open/Pro)"
                                                                                                                                                                                           },
                                                                                                                                                                                             {
                                                                                                                                                                                                 id: "lunges",
                                                                                                                                                                                                     name: "Sandbag Lunges",
                                                                                                                                                                                                         icon: "\u{1F6B6}",
                                                                                                                                                                                                             distanceLabel: "100 m",
                                                                                                                                                                                                                 inputType: "weightTime",
                                                                                                                                                                                                                     hint: "Richtwerte: Women 10/20 kg · Men 20/30 kg (Open/Pro)"
                                                                                                                                                                                                                       },
                                                                                                                                                                                                                         {
                                                                                                                                                                                                                             id: "wallballs",
                                                                                                                                                                                                                                 name: "Wall Balls",
                                                                                                                                                                                                                                     icon: "\u{1F3D0}",
                                                                                                                                                                                                                                         distanceLabel: "100 Wiederholungen",
                                                                                                                                                                                                                                             inputType: "weightTime",
                                                                                                                                                                                                                                                 hint: "Richtwerte: Women 4/6 kg · Men 6/9 kg (Open/Pro)"
                                                                                                                                                                                                                                                   }
                                                                                                                                                                                                                                                   ];
                                                                                                                                                                                                                                                   
                                                                                                                                                                                                                                                   // Build the full alternating path: Run 1, Station 1, Run 2, Station 2, ...
                                                                                                                                                                                                                                                   function buildPath() {
                                                                                                                                                                                                                                                     const path = [];
                                                                                                                                                                                                                                                       STATIONS.forEach((station, i) => {
                                                                                                                                                                                                                                                           path.push({ kind: "run", id: `run${i + 1}`, index: i + 1, label: RUN_DISTANCE_LABEL });
                                                                                                                                                                                                                                                               path.push({ kind: "station", ...station });
                                                                                                                                                                                                                                                                 });
                                                                                                                                                                                                                                                                   return path;
                                                                                                                                                                                                                                                                   }
                                                                                                                                                                                                                                                                   
