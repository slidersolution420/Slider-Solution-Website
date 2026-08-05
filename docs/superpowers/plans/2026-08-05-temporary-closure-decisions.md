# החלטות ביצוע — סגירה זמנית 5/8/2026
- PRE_CLOSURE_SHA: 825af63
<!-- כל סטייה מהתוכנית: שורה אחת — מה קרה, מה נבחר, למה זו האופציה השמרנית -->
- Step 4.1: build עבר נקי; אזהרת deprecation לא-חוסמת מ-Next 16 ("middleware" file convention deprecated, use "proxy" instead) — התוכנית עצמה קבעה מפורשות שהשם חייב להיות middleware.ts (Next עדיין תומך בו, רק מוריד "עדיפות" בהמשך). לא שינינו שם קובץ; זה מחוץ לתחולת הסגירה.
- Step 0.5: `npm run lint` שבור (`next lint` הוסר ב-Next 16; `npx eslint .` נכשל גם עם `TypeError: Converting circular structure to JSON` בתצורת eslint-config-next הקיימת) — תקלת תשתית קיימת מקודם, לא קשורה לסגירה. הוחלט לא לתקן; ממשיכים בלי lint, מסתמכים על `type-check` (עבר נקי) + `build` לאימות. כל שלב הבא שכולל `&& npm run lint` ירוץ בלי החלק הזה.
