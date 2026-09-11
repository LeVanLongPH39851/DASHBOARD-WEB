{% set filter_channel = filter_values('channel_name_tvd', remove_filter=True) %}
{% set filter_event = filter_values('event_category_name', remove_filter=True) %}
{% set filter_day = filter_values('days_of_week', remove_filter=True) %}
{% set filter_regional = filter_values('regional_name', remove_filter=True) %}
{% set filter_key_city = filter_values('key_city', remove_filter=True) %}
{% set filter_province = filter_values('province', remove_filter=True) %}
{% set filter_others = filter_values('others', remove_filter=True) %}
{% set filter_time_band = filter_values('time_band', remove_filter=True) %}
{% set filter_date = filter_values('date', remove_filter=True) %}
{% set filter_user_id = filter_values('user_id', remove_filter=True) %}

{% set active = 'active' %}
{% set regions = ('Trung du và miền núi phía Bắc', 'Đồng bằng sông Hồng', 'Bắc Trung Bộ',
                  'Nam Trung Bộ và Tây Nguyên',
                  'Đông Nam Bộ', 'Đồng bằng sông Cửu Long') %}
WITH rating_ott AS (
SELECT BITMAP_UNION_COUNT(bm_user_id) AS distinct_user_by_day,
SUM(duration_view) AS duration_view, date
{% if filter_channel|reject('equalto', active)|list|length > 0 or active in filter_channel %} , channel_name_tvd {% endif %}
{% if active in filter_event %} , event_category_name {% endif %}
{% if active in filter_day %} , days_of_week {% endif %}
{% if active in filter_regional or (filter_regional|length > 0 and filter_province|length <= 0) %} , regional_name {% endif %}
{% if active in filter_key_city %} , key_city {% endif %}
{% if filter_province|length > 0 or filter_key_city|length > 0 %} , province_name AS province {% endif %}
{% if active in filter_others %} , 'Toàn quốc' AS others {% endif %}
{% if active in filter_time_band %} , time_band {% endif %}
FROM data_dashboard_rating.agg_info_channel
WHERE date BETWEEN
{% if filter_date|length > 0 and filter_date[0] != 'No filter' and filter_date[0].split(" : ")[0]|length == 19 %}
  '{{ filter_date[0].split(" : ")[0] }}' AND '{{ filter_date[0].split(" : ")[1] }}'
{% else %}
  {% if '7 days' in filter_day %}
    DATE_SUB(CURRENT_DATE(), INTERVAL 7 DAY) AND DATE_SUB(CURRENT_DATE(), INTERVAL 1 DAY)
  {% else %}
    DATE_SUB(CURRENT_DATE(), INTERVAL 1 DAY) AND DATE_SUB(CURRENT_DATE(), INTERVAL 1 DAY)
  {% endif %}
{% endif %}
{% if filter_channel|reject('equalto', active)|list|length > 0  %} AND channel_name_tvd IN {{ filter_channel|reject('equalto', active)|list|where_in }} {% endif %}
{% if filter_event|reject('equalto', active)|list|length > 0 %} AND event_category_name IN {{ filter_event|reject('equalto', active)|list|where_in }} {% endif %}
{% if filter_day|reject('in', [active, '7 days'])|list|length > 0 %} AND days_of_week IN {{ filter_day|reject('in', [active, '7 days'])|list|where_in }} {% endif %}
{% if filter_regional|reject('equalto', active)|list|length > 0 %} AND regional_name IN {{ filter_regional|reject('equalto', active)|list|where_in }} {% endif %}
{% if filter_key_city|reject('equalto', active)|list|length > 0 %} AND key_city IN {{ filter_key_city|reject('equalto', active)|list|where_in }} {% endif %}
{% if filter_province|reject('equalto', active)|list|length > 0 %} AND province_name IN {{ filter_province|reject('equalto', active)|list|where_in }} {% endif %}
{% if filter_others|reject('equalto', active)|list|length > 0 %} AND others IN {{ filter_others|reject('equalto', active)|list|where_in }} {% endif %}
{% if filter_time_band|reject('equalto', active)|list|length > 0 %} AND time_band IN {{ filter_time_band|reject('equalto', active)|list|where_in }} {% endif %}
{% if active in filter_regional or active in filter_province or active in filter_others %}
  AND province_name NOT IN ('Không rõ')
{% endif %}
{% if active in filter_key_city %} AND key_city IS NOT NULL {% endif %}
{% if filter_user_id|length > 0 %} AND 'user_id' <> '{{ filter_user_id[0] }}' {% endif %}
GROUP BY date

{% if active in filter_event %} , event_category_name {% endif %}
{% if active in filter_day %} , days_of_week {% endif %}
{% if active in filter_regional or (filter_regional|length > 0 and filter_province|length <= 0) %} , regional_name {% endif %}
{% if active in filter_key_city %} , key_city {% endif %}
{% if filter_province|length > 0 or filter_key_city|length > 0 %} , province_name {% endif %}
{% if active in filter_others %} , others {% endif %}
{% if active in filter_time_band %} , time_band {% endif %}
{% if filter_channel|reject('equalto', active)|list|length > 0 or active in filter_channel %} , channel_name_tvd {% endif %}),

dim_weight AS (
SELECT date, weight, province
{% if filter_channel|reject('equalto', active)|list|length > 0 or active in filter_channel %} , channel_name_tvd {% endif %}
FROM data_dashboard_rating.weight_reach_v2
WHERE {% if filter_province|length > 0 or filter_key_city|length > 0 %}
        province NOT IN {{ regions }} AND province <> 'Toàn quốc'
      {% elif filter_regional|length > 0 %} province IN {{ regions }}
      {% else %} province = 'Toàn quốc' {% endif %}
{% if filter_channel|reject('equalto', active)|list|length > 0 %} 
AND channel_name_tvd IN {{ filter_channel|reject('equalto', active)|list|where_in }} 
{% elif active not in filter_channel %} 
AND channel_name_tvd ='Total'
{% endif %}
AND date BETWEEN
{% if filter_date|length > 0 and filter_date[0] != 'No filter' and filter_date[0].split(" : ")[0]|length == 19 %}
  '{{ filter_date[0].split(" : ")[0] }}' AND '{{ filter_date[0].split(" : ")[1] }}'
{% else %}
  {% if '7 days' in filter_day %}
    DATE_SUB(CURRENT_DATE(), INTERVAL 7 DAY) AND DATE_SUB(CURRENT_DATE(), INTERVAL 1 DAY)
  {% else %}
    DATE_SUB(CURRENT_DATE(), INTERVAL 1 DAY) AND DATE_SUB(CURRENT_DATE(), INTERVAL 1 DAY)
  {% endif %}
{% endif %}),

dim_population AS (SELECT total, province FROM data_dashboard_rating.province_statistics
WHERE {% if filter_province|length > 0 or filter_key_city|length > 0 %}
        province NOT IN {{ regions }} AND province <> 'Toàn quốc'
      {% elif filter_regional|length > 0 %} province IN {{ regions }}
      {% else %} province = 'Toàn quốc' {% endif %}),
      
dim_coef AS (
SELECT date,
view_coef,
user_coef
FROM data_dashboard_rating.coef_statistics WHERE 1 = 1
AND date BETWEEN
{% if filter_date|length > 0 and filter_date[0] != 'No filter' and filter_date[0].split(" : ")[0]|length == 19 %}
  '{{ filter_date[0].split(" : ")[0] }}' AND '{{ filter_date[0].split(" : ")[1] }}'
{% else %}
  {% if '7 days' in filter_day %}
    DATE_SUB(CURRENT_DATE(), INTERVAL 7 DAY) AND DATE_SUB(CURRENT_DATE(), INTERVAL 1 DAY)
  {% else %}
    DATE_SUB(CURRENT_DATE(), INTERVAL 1 DAY) AND DATE_SUB(CURRENT_DATE(), INTERVAL 1 DAY)
  {% endif %}
{% endif %})   

SELECT ra.*, we.weight, po.total, co.view_coef, co.user_coef 
FROM rating_ott ra 
JOIN dim_weight we ON ra.date = we.date
{% if filter_channel|reject('equalto', active)|list|length > 0 or active in filter_channel %} 
AND ra.channel_name_tvd = we.channel_name_tvd
{% endif %}
{% if filter_province|length > 0 or filter_key_city|length > 0 %}
  AND ra.province = we.province
{% elif filter_regional|length > 0 %}
  AND ra.regional_name = we.province
{% endif %}
JOIN dim_population po ON 1 = 1
{% if filter_province|length > 0 or filter_key_city|length > 0 %}
  AND ra.province = po.province
{% elif filter_regional|length > 0 %}
  AND ra.regional_name = po.province
{% endif %}
JOIN dim_coef co ON ra.date = co.date
