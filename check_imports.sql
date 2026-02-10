SELECT COUNT(*) as total_transactions, 
       DATE(date) as transaction_date,
       description
FROM budget_transactions 
WHERE user_id = 1 
  AND date >= '2026-02-01'
GROUP BY DATE(date), description
ORDER BY date DESC;
