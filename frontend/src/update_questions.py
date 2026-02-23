import json

new_questions = [
  {
    "id": 488,
    "question": "1. Con respecto a los betalactámicos, marque la respuesta INCORRECTA:",
    "options": [
      "a) Son bactericidas.",
      "b) Inhiben la síntesis de la pared celular bacteriana.",
      "c) Son efectivos contra bacterias Gram positivas y Gram negativas.",
      "d) La penicilina es un ejemplo de betalactámico de primera generación.",
      "e) La resistencia a los betalactámicos siempre se debe a la producción de betalactamasas."
    ],
    "answer": "E",
    "explanation": "La resistencia a los betalactámicos no 'siempre' se debe a betalactamasas. Bacterias como el Neumococo o el S. aureus meticilino resistente (SAMR) generan resistencia alterando el sitio blanco, es decir, modificando las Proteínas Fijadoras de Penicilina (PBP)."
  },
  {
    "id": 489,
    "question": "3. Con respecto a los fármacos antituberculosos de 1ª línea (señale la correcta):",
    "options": [
      "a) Son todos bactericidas.",
      "b) El etambutol puede producir hepatopatía grave.",
      "c) La isoniacida se elimina principalmente por excreción renal.",
      "d) La rifampicina tiene como efectos adversos más frecuentes náuseas y vómitos, exantema y fiebre.",
      "e) La pirazinamida tiene acción bactericida sólo en medios básicos."
    ],
    "answer": "D",
    "explanation": "La rifampicina suele causar intolerancia gastrointestinal, erupciones y síndromes febriles. Las demás son falsas: el etambutol es bacteriostático y causa neuritis óptica (no hepatopatía), la isoniacida es de metabolismo hepático (acetilación), y la pirazinamida actúa en medio ÁCIDO."
  },
  {
    "id": 490,
    "question": "4. ¿Cuál de las siguientes afirmaciones sobre el metronidazol es INCORRECTA?",
    "options": [
      "a) Es efectivo contra bacterias aerobias.",
      "b) Puede causar coloración oscura de la orina.",
      "c) Puede causar neurotoxicidad leve o grave.",
      "d) Se utiliza para tratar infecciones protozoarias.",
      "e) Es amebicida, antianaeróbico y antitricomonásico."
    ],
    "answer": "A",
    "explanation": "El metronidazol requiere de un entorno sin oxígeno para que su grupo nitro sea reducido a radicales libres tóxicos. Por ende, carece de total actividad contra bacterias aerobias; su espectro es exclusivo para anaerobios estrictos y protozoos."
  },
  {
    "id": 491,
    "question": "5. ¿Cuál de los siguientes fármacos es considerado el tratamiento de elección para el alivio rápido (rescate) de los síntomas agudos del asma (broncoconstricción)?",
    "options": [
      "a) Salmeterol",
      "b) Montelukast",
      "c) Budesonida inhalada",
      "d) Fluticasona (inhalada)",
      "e) Terbutalina"
    ],
    "answer": "E",
    "explanation": "La terbutalina (al igual que el salbutamol) es un agonista Beta-2 de acción corta (SABA), indicado específicamente como medicación de rescate para revertir rápidamente el broncoespasmo agudo. El salmeterol es LABA (mantenimiento), y los corticoides no broncodilatan en agudo."
  },
  {
    "id": 492,
    "question": "7. Marcar la respuesta CORRECTA con relación al tratamiento antihipertensivo con IECA:",
    "options": [
      "a) Es probable su uso en combinación con losartán en el tratamiento inicial de hipertensión de novo en sujetos con baja asociación de efectos adversos y potenciación de efecto.",
      "b) La principal característica de los IECA es evitar la transformación de angiotensinógeno en angiotensina II a nivel hepático.",
      "c) El uso de los IECA se encuentra contraindicado en los pacientes que han sufrido infarto agudo de miocardio por su efecto negativo sobre el remodelado cardíaco postinfarto.",
      "d) La administración de enalapril puede causar hipotensión brusca si los niveles de renina son elevados.",
      "e) Enalapril hipokalemia por aumento en los niveles de aldosterona."
    ],
    "answer": "D",
    "explanation": "Los pacientes con niveles altos de renina (ej. depleción de volumen por diuréticos previos) dependen mucho del SRAA para mantener la presión. Iniciar un IECA en ellos puede causar una grave hipotensión de primera dosis."
  },
  {
    "id": 493,
    "question": "8. ¿Cuál de los siguientes grupos farmacológicos representa actualmente el tratamiento más potente y de elección para la supresión de ácido en el manejo de la Enfermedad por Úlcera Péptica y el Reflujo Gastroesofágico?",
    "options": [
      "a) Antagonistas del receptor H2 de histamina (Ej: Ranitidina)",
      "b) Antiácidos (Ej: Sales de Magnesio y Aluminio)",
      "c) Agentes protectores de la mucosa (Ej: Sucralfato)",
      "d) Inhibidores de la Bomba de Protones (IBP) (Ej: Omeprazol)",
      "e) Análogos de Prostaglandinas (Ej: Misoprostol)"
    ],
    "answer": "D",
    "explanation": "Los Inhibidores de la Bomba de Protones (IBP) son la terapia más potente, ya que bloquean irreversiblemente la vía final común de la secreción ácida (la H+/K+ ATPasa) en la célula parietal."
  },
  {
    "id": 494,
    "question": "9. Marcar la respuesta CORRECTA respecto al tratamiento con estatinas:",
    "options": [
      "a) Las estatinas tienen inicio de acción rápido, alcanzan efecto terapéutico dentro de las primeras 24 hs.",
      "b) Su principal mecanismo de acción involucrado en su efecto terapéutico es la inhibición enzimática de la HMG-CoA reductasa.",
      "c) La rosuvastatina es una droga con alta potencia de efecto hipoglucemiante.",
      "d) El tratamiento con estatinas se relaciona con un aumento en las concentraciones de triglicéridos como efecto adverso.",
      "e) El tratamiento con estatinas puede asociarse a neuropatía periférica por déficit de absorción de vitamina B12."
    ],
    "answer": "B",
    "explanation": "La inhibición de la hidroximetilglutaril-CoA (HMG-CoA) reductasa frena la síntesis hepática de colesterol, lo que obliga al hígado a expresar más receptores LDL para captar colesterol de la sangre, disminuyendo la colesterolemia."
  },
  {
    "id": 495,
    "question": "11. ¿Cuál de las siguientes drogas tiene mayor riesgo de hipoglucemia? (señale la correcta):",
    "options": [
      "a) Glibenclamida",
      "b) Repaglinida",
      "c) Metformina",
      "d) Linagliptina",
      "e) Semaglutida"
    ],
    "answer": "A",
    "explanation": "La glibenclamida es una sulfonilurea de acción prolongada. Su mecanismo (forzar la secreción de insulina pancreática de forma independiente de la glucemia) la convierte en el antidiabético oral con mayor tasa de hipoglucemias severas."
  },
  {
    "id": 496,
    "question": "12. ¿Cuál de estos efectos adversos es el más frecuente con agonistas GLP-1 (incretinas)? (señale la correcta):",
    "options": [
      "a) Hiperglucemia",
      "b) Acidosis láctica",
      "c) Alteraciones del TSH",
      "d) Hipercolesterolemia",
      "e) Náuseas y vómitos"
    ],
    "answer": "E",
    "explanation": "Los agonistas de GLP-1 (como semaglutida o liraglutida) retrasan el vaciamiento gástrico y actúan a nivel central. Por ello, sus efectos adversos predominantes y limitantes al inicio del tratamiento son siempre gastrointestinales (náuseas, vómitos, diarrea)."
  },
  {
    "id": 497,
    "question": "13. Un paciente con diabetes mellitus tipo 2 está recibiendo tratamiento con glucocorticoides. ¿Qué ajuste en su tratamiento antidiabético es probable que sea necesario?",
    "options": [
      "a) Disminuir la dosis de insulina o de los antidiabéticos orales.",
      "b) Aumentar la dosis de insulina o de los antidiabéticos orales.",
      "c) Mantener la misma dosis de insulina o de los antidiabéticos orales.",
      "d) Suspender temporalmente el tratamiento antidiabético.",
      "e) Ninguno de los anteriores."
    ],
    "answer": "B",
    "explanation": "Los glucocorticoides promueven fuertemente la gluconeogénesis hepática y aumentan la resistencia periférica a la insulina. Al ser drogas hiperglucemiantes, casi invariablemente requerirán un aumento en la dosis de los fármacos hipoglucemiantes del paciente."
  },
  {
    "id": 498,
    "question": "14. ¿Cuál de los siguientes efectos adversos es un riesgo importante y bien conocido asociado con la supresión del eje hipotálamo-hipófiso-suprarrenal (HHS) debido al uso prolongado de glucocorticoides sistémicos?",
    "options": [
      "a) Hiperkalemia",
      "b) Hiperglucemia",
      "c) Insuficiencia suprarrenal aguda al suspender el tratamiento",
      "d) Hipertrofia suprarrenal tumoral",
      "e) Aumento de la masa muscular esquelética"
    ],
    "answer": "C",
    "explanation": "El uso exógeno crónico de corticoides frena por feedback negativo la producción de CRH y ACTH, atrofiando las glándulas suprarrenales. Si la droga se suspende bruscamente, el cuerpo no puede producir cortisol endógeno, desencadenando una crisis suprarrenal aguda letal."
  },
  {
    "id": 499,
    "question": "15. ¿Cuál de los siguientes AINES tiene menos probabilidad de producir gastropatía?",
    "options": [
      "a) Aspirina",
      "b) Ketorolac",
      "c) Etoricoxib",
      "d) Ketoprofeno",
      "e) Diclofenac"
    ],
    "answer": "C",
    "explanation": "El etoricoxib es un inhibidor selectivo de la COX-2 (coxib). Al no inhibir la COX-1 constitutiva de la mucosa gástrica, respeta la síntesis de prostaglandinas protectoras del estómago, reduciendo el riesgo de úlceras en comparación con los AINEs no selectivos."
  },
  {
    "id": 500,
    "question": "16. ¿Cuál es el mecanismo fisiopatológico por el cual los AINES pueden causar insuficiencia renal aguda o empeorar una enfermedad renal preexistente, especialmente en pacientes con hipovolemia o insuficiencia cardíaca?",
    "options": [
      "a) Inhibición directa de la reabsorción de sodio en el túbulo proximal.",
      "b) Bloqueo de la COX-1 en las plaquetas.",
      "c) Inhibición de la síntesis de prostaglandinas vasodilatadoras renales (PGE2 y PGI2).",
      "d) Estimulación de la liberación de renina por el aparato yuxtaglomerular.",
      "e) Daño directo a los podocitos en el glomérulo renal."
    ],
    "answer": "C",
    "explanation": "En estados de hipoperfusión (IC, hipovolemia), el riñón depende críticamente de las prostaglandinas vasodilatadoras (PGE2/PGI2) para mantener el flujo en la arteriola aferente. Los AINEs bloquean esto, causando vasoconstricción severa e isquemia renal aguda."
  },
  {
    "id": 501,
    "question": "18. El lorazepam se puede utilizar de forma segura como medicamento preanestésico en un paciente sometido a trasplante de hígado, sin temor a una depresión excesiva del SNC porque el fármaco es:",
    "options": [
      "a) Excretado en forma inalterada.",
      "b) Secretado activamente en el TGI.",
      "c) Conjugado extrahepáticamente.",
      "d) Un ansiolítico selectivo desprovisto de acciones depresoras del SNC.",
      "e) Reversible por naloxona."
    ],
    "answer": "C",
    "explanation": "Benzodiacepinas como el Lorazepam, Oxazepam y Temazepam (nemotecnia LOT) no requieren metabolismo oxidativo (fase I) por el citocromo P450; van directo a conjugación glucurónica (fase II). Por eso son las de elección y más seguras en pacientes con daño o falla hepática."
  },
  {
    "id": 502,
    "question": "19. ¿Cuál de los siguientes efectos secundarios es más probable que ocurra al inicio del tratamiento con levodopa?",
    "options": [
      "a) Discinesias",
      "b) Fluctuaciones motoras (fenómeno on-off)",
      "c) Náuseas y vómitos",
      "d) Congelamiento (freezing)",
      "e) Psicosis crónica"
    ],
    "answer": "C",
    "explanation": "Al inicio del tratamiento con levodopa, el efecto adverso más común son las náuseas y vómitos severos. Esto ocurre porque la L-DOPA se convierte periféricamente en dopamina, la cual estimula directamente la zona gatillo quimiorreceptora en el área postrema (que no tiene barrera hematoencefálica)."
  },
  {
    "id": 503,
    "question": "1. Paciente de 65 años con IC y broncoespasmo severo. ¿Qué fármaco usar?",
    "options": [
      "A. Propranolol",
      "B. Atenolol",
      "C. Carvedilol",
      "D. Bromuro de Ipratropio",
      "E. Amiodarona"
    ],
    "answer": "D",
    "explanation": "En un paciente con IC pero cursando un broncoespasmo severo activo, el uso de betabloqueantes está temporalmente contraindicado. El Bromuro de Ipratropio (anticolinérgico) aporta broncodilatación sin empeorar la condición cardiovascular en el evento agudo."
  },
  {
    "id": 504,
    "question": "2. Paciente de 25 años asmático con salbutamol + budesonida. ¿Cuál es el siguiente paso terapéutico?",
    "options": [
      "A. Aumentar dosis de SABA",
      "B. Agregar un LABA (ej. Formoterol)",
      "C. Omalizumab",
      "D. Corticoides sistémicos crónicos",
      "E. Suspender budesonida"
    ],
    "answer": "B",
    "explanation": "Según las guías GINA/GEMA, si el asma no está controlada con dosis bajas/medias de corticoide inhalado (budesonida) más rescate (salbutamol), el escalón siguiente es añadir un beta-2 de acción prolongada (LABA), usualmente en un dispositivo combinado."
  },
  {
    "id": 505,
    "question": "3. Paciente de 70 años con EPOC tratado con tiotropio. ¿Cuál es el efecto adverso más esperado?",
    "options": [
      "A. Diarrea profusa",
      "B. Temblor muscular",
      "C. Boca seca (xerostomía)",
      "D. Hipotensión ortostática",
      "E. Candidiasis oral"
    ],
    "answer": "C",
    "explanation": "El tiotropio es un antagonista muscarínico de larga duración (LAMA). Al ser inhalado, su absorción sistémica es baja, pero el bloqueo colinérgico local en la vía aérea y boca frecuentemente genera sequedad bucal (xerostomía) como efecto adverso principal."
  },
  {
    "id": 506,
    "question": "6. Paciente de 55 años con angina de pecho tratado con atenolol. ¿Cuál es el efecto adverso a vigilar?",
    "options": [
      "A. Taquicardia refleja",
      "B. Hipokalemia",
      "C. Bradicardia y bloqueo AV",
      "D. Rubor facial",
      "E. Edema maleolar"
    ],
    "answer": "C",
    "explanation": "El atenolol es un betabloqueante cardioselectivo (beta-1). Ejerce un efecto dromotrópico y cronotrópico negativo, por lo que el monitoreo estricto debe enfocarse en la prevención de bradicardias sintomáticas o bloqueos auriculoventriculares."
  },
  {
    "id": 507,
    "question": "9. Paciente de 65 años con artrosis severa que requiere uso continuo de diclofenac. ¿Con qué fármaco se debe prevenir la gastropatía por AINEs?",
    "options": [
      "A. Ranitidina",
      "B. Bismuto",
      "C. Pantoprazol u Omeprazol",
      "D. Sucralfato",
      "E. Metoclopramida"
    ],
    "answer": "C",
    "explanation": "La profilaxis estándar de oro para prevenir úlceras en pacientes de alto riesgo (como adultos mayores) que requieren AINEs de forma crónica, son los Inhibidores de la Bomba de Protones (IBP), como el omeprazol o pantoprazol."
  },
  {
    "id": 508,
    "question": "12. Paciente de 70 años con DBT2, insulina NPH e hipoglucemias nocturnas recurrentes. ¿Qué conducta tomar?",
    "options": [
      "A. Cambiar NPH por insulina Regular",
      "B. Aumentar dosis de NPH en la cena",
      "C. Cambiar a análogo basal de larga duración (Glargina/Degludec)",
      "D. Agregar sulfonilurea",
      "E. Suspender todo tratamiento"
    ],
    "answer": "C",
    "explanation": "La insulina NPH tiene un pico de acción a las 4-8 horas, lo que en dosis nocturnas predispone fuertemente a hipoglucemias de madrugada. Los análogos basales sin pico (Glargina, Degludec) reducen drásticamente este riesgo nocturno."
  },
  {
    "id": 509,
    "question": "15. Paciente de 60 años con enfermedad de Addison (insuficiencia suprarrenal). ¿Cuál es la función específica de la fludrocortisona en su esquema?",
    "options": [
      "A. Suprimir la ACTH tumoral",
      "B. Brindar reemplazo mineralocorticoide para retener sodio y presión",
      "C. Aportar efecto antiinflamatorio potente",
      "D. Reemplazar andrógenos adrenales",
      "E. Disminuir la glucemia"
    ],
    "answer": "B",
    "explanation": "En la insuficiencia suprarrenal primaria se pierde tanto cortisol como aldosterona. La fludrocortisona se administra específicamente por su altísima potencia mineralocorticoide, reemplazando la función de la aldosterona para retener sodio y evitar la hipotensión."
  },
  {
    "id": 510,
    "question": "21. Paciente de 60 años con insomnio de conciliación tratado con zolpidem. ¿Cuál es su ventaja farmacológica respecto a las benzodiacepinas clásicas?",
    "options": [
      "A. Es anticonvulsivante potente",
      "B. Vida media larguísima",
      "C. Preserva mejor la arquitectura del sueño sin efecto miorrelajante",
      "D. No interactúa con el receptor GABA",
      "E. Actúa sobre receptores de melatonina"
    ],
    "answer": "C",
    "explanation": "El zolpidem es un fármaco 'Z' que se une selectivamente a la subunidad alfa-1 del receptor GABA-A. Su gran ventaja es que induce sueño respetando las fases normales, con mínimos efectos residuales al día siguiente y careciendo de acciones miorrelajantes o anticonvulsivantes excesivas."
  }
]

with open('d:/Programacion/studyplat/frontend/src/questions.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

data.extend(new_questions)

with open('d:/Programacion/studyplat/frontend/src/questions.json', 'w', encoding='utf-8') as f:
    json.dump(data, f, indent=2, ensure_ascii=False)

print(f"Successfully added {len(new_questions)} items. Total questions now: {len(data)}")
