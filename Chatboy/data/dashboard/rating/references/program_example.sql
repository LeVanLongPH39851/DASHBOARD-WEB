SELECT channel_name_tvd                                            AS channel_name_tvd,
       SUM(duration_view * weight * view_coef) / 60 /
       (18
           * 60 * COUNT(DISTINCT date))                            AS rating,
       SUM(duration_view * weight * view_coef) * 100 /
       (18
           * 60 * COUNT(DISTINCT date) * 60 * SUM(DISTINCT total)) AS `rating%`,
       SUM(distinct_user_by_day * weight) /
       COUNT(DISTINCT date)                                        AS ave_reach,
       SUM(distinct_user_by_day * weight) /
       COUNT(DISTINCT date) * 100 / SUM(DISTINCT total)            AS `reach%`,
       SUM(duration_view * weight * view_coef) / 60 /
       SUM(distinct_user_by_day * weight)                          AS minute_user_day
FROM (WITH rating_ott AS (SELECT BITMAP_UNION_COUNT(bm_user_id) AS distinct_user_by_day,
                                 SUM(duration_view)             AS duration_view,
                                 date
                                  ,
                                 channel_name_tvd


                          FROM data_dashboard_rating.agg_info_channel
                          WHERE date BETWEEN
                                    DATE_SUB(CURRENT_DATE(), INTERVAL 1 DAY) AND DATE_SUB(CURRENT_DATE(), INTERVAL 1 DAY)


                          GROUP BY date
                                 , channel_name_tvd),

           dim_weight AS (SELECT date
                               , weight
                               , province
                               , channel_name_tvd
                          FROM data_dashboard_rating.weight_reach_v2
                          WHERE province = 'Toàn quốc'

                            AND date BETWEEN
                              DATE_SUB(CURRENT_DATE(), INTERVAL 1 DAY) AND DATE_SUB(CURRENT_DATE(), INTERVAL 1 DAY)),

           dim_population AS (SELECT total, province
                              FROM data_dashboard_rating.province_statistics
                              WHERE province = 'Toàn quốc'),

           dim_coef AS (SELECT date,
                               view_coef,
                               user_coef
                        FROM data_dashboard_rating.coef_statistics
                        WHERE 1 = 1
                          AND date BETWEEN
                            DATE_SUB(CURRENT_DATE(), INTERVAL 1 DAY) AND DATE_SUB(CURRENT_DATE(), INTERVAL 1 DAY))

      SELECT ra.*, we.weight, po.total, co.view_coef, co.user_coef
      FROM rating_ott ra
               JOIN dim_weight we ON ra.date = we.date
          AND ra.channel_name_tvd = we.channel_name_tvd


               JOIN dim_population po ON 1 = 1

               JOIN dim_coef co ON ra.date = co.date) AS virtual_table
GROUP BY channel_name_tvd
ORDER BY rating DESC
LIMIT 50000;