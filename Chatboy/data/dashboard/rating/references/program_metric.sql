# Chương trình

1 - Phút/người/ngày: 
SUM(duration_view*weight*view_coef)/60/
SUM(distinct_user_by_day*weight)

2 - Ave.REACH (người/lượt phát)
SUM(distinct_user_by_day*weight*user_coef)/
COUNT(DISTINCT date)

3 - REACH %
SUM(distinct_user_by_day*weight)/
COUNT(DISTINCT date)*100/SUM(DISTINCT total)

4 - RATING %
SUM(duration_view*weight*view_coef)*100/
(COUNT(DISTINCT time_band)*60*COUNT(DISTINCT date)*60*SUM(DISTINCT total))

# Kênh

1 - Phút/người/ngày: 
SUM(duration_view*weight*view_coef)/60/
SUM(distinct_user_by_day*weight)

2 - Ave.REACH (người/lượt phát)
SUM(distinct_user_by_day*weight)/
COUNT(DISTINCT date)

3 - REACH %
SUM(distinct_user_by_day*weight)/
COUNT(DISTINCT date)*100/SUM(DISTINCT total)

4 - RATING %
SUM(duration_view*weight*view_coef)*100/
({% if filter_values('time_band')|length > 0 %}{{ filter_values('time_band')|length }}{% else %}18{% endif %}
*60*COUNT(DISTINCT date)*60*SUM(DISTINCT total))

5- RATING (người/phút)
SUM(duration_view*weight*view_coef)/60/
({% if filter_values('time_band')|length > 0 %}{{ filter_values('time_band')|length }}{% else %}18{% endif %}
*60*COUNT(DISTINCT date))