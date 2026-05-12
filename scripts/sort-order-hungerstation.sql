-- Sort order matching Hungerstation menu
UPDATE menu_items SET sort_order = CASE id
  -- Rice Plates
  WHEN 72  THEN 1   -- Chicken Rice
  WHEN 100 THEN 2   -- Ground Beef
  WHEN 74  THEN 3   -- Salmon Rice
  -- Salads
  WHEN 4   THEN 4   -- Crisp Salad
  WHEN 9   THEN 5   -- Avocado Salad
  WHEN 10  THEN 6   -- Crunch Chicken
  WHEN 5   THEN 7   -- Mexican
  WHEN 8   THEN 8   -- Crab
  WHEN 11  THEN 9   -- Shrimp
  WHEN 3   THEN 10  -- Lentil
  -- Sandwiches
  WHEN 102 THEN 11  -- Egg Salad
  WHEN 15  THEN 12  -- Grilled Chicken
  WHEN 14  THEN 13  -- Spicy Grilled
  WHEN 103 THEN 14  -- Pesto
  WHEN 18  THEN 15  -- Tuna
  WHEN 16  THEN 16  -- Spicy Tuna
  WHEN 22  THEN 17  -- Cheesy Turkey
  WHEN 21  THEN 18  -- Halloumi
  WHEN 101 THEN 19  -- Burrata
  WHEN 19  THEN 20  -- PB Strawberry Jam
  WHEN 20  THEN 21  -- PB Blueberry Jam
  -- Chips
  WHEN 23  THEN 22  -- Sweet Potato Chips
  WHEN 25  THEN 23
  WHEN 24  THEN 24
  -- Granola & Yogurt
  WHEN 30  THEN 25  -- Strawberry Yogurt
  WHEN 29  THEN 26  -- Blueberry Yogurt
  WHEN 27  THEN 27  -- Granola
  WHEN 28  THEN 28  -- Chocolate Granola
  -- Dips
  WHEN 37  THEN 29  -- Hummus
  WHEN 35  THEN 30  -- Beetroot Hummus
  WHEN 36  THEN 31
  WHEN 33  THEN 32
  WHEN 34  THEN 33
  WHEN 31  THEN 34
  -- Crunches
  WHEN 42  THEN 35  -- Protein Crackers
  WHEN 45  THEN 36  -- Cacao / Chocolate Biscuit
  WHEN 43  THEN 37  -- Zatar Crackers
  WHEN 44  THEN 38  -- Zatar Chocolate
  WHEN 48  THEN 39  -- Crunchy Corn
  WHEN 104 THEN 40  -- Chocolate Protein Sticks
  WHEN 47  THEN 41
  WHEN 46  THEN 42
  -- Healthy Sweets
  WHEN 99  THEN 43  -- Overnight
  WHEN 105 THEN 44  -- Chocolate Pudding
  WHEN 106 THEN 45  -- Choco Pudding PB
  WHEN 52  THEN 46  -- Snickers
  WHEN 55  THEN 47  -- Protein Butter Bar
  WHEN 53  THEN 48  -- Protein Crunchy Rice
  WHEN 107 THEN 49  -- Dark Rocky Road
  WHEN 108 THEN 50  -- Dark Choco Bar
  WHEN 109 THEN 51  -- Brownie Balls
  WHEN 51  THEN 52
  WHEN 50  THEN 53
  WHEN 49  THEN 54
  WHEN 54  THEN 55
  -- Sauces
  WHEN 56  THEN 56  -- Caesar
  WHEN 57  THEN 57  -- Green
  WHEN 58  THEN 58  -- Avo
  WHEN 61  THEN 59  -- Viney
  WHEN 60  THEN 60  -- Asian
  WHEN 59  THEN 61
  -- Beverages
  WHEN 70  THEN 62  -- Perrier
  WHEN 64  THEN 63  -- Beetroot Juice
  WHEN 69  THEN 64  -- Cola Light
  WHEN 68  THEN 65  -- Cola Zero
  WHEN 63  THEN 66  -- Fresh Green Juice
  WHEN 65  THEN 67  -- Fresh Orange Juice
  WHEN 66  THEN 68  -- Protein Avo Smoothie
  WHEN 67  THEN 69  -- Protein Dates
  WHEN 62  THEN 70
  WHEN 71  THEN 71
  -- Pickles
  WHEN 38  THEN 72
  WHEN 39  THEN 73
  WHEN 40  THEN 74
  WHEN 41  THEN 75
  ELSE sort_order
END;
