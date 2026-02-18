-- Monthly income
SELECT 
    strftime("%Y-%m", date, 'unixepoch') AS Month,
    SUM(amount) AS total_income
FROm transactions
WHERE type = 'income'
GROUP BY month
ORDER BY month


-- Monthly expense, income
SELECT 
    strftime("%Y-%m", date, 'unixepoch') AS Month,
    SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END) as income,
    SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END) as expense
FROm transactions
GROUP BY month
ORDER BY month
