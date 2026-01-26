<?php
namespace App\Metrics;

class ReachMetric {
    public $aveReachMetricName = 'ave_reach';
    public $aveReachMetric = 'SUM(distinct_user_by_day * weight_national) / COUNT(DISTINCT date) AS ave_reach';

    public $aveReachPercentMetricName = 'ave_reach_percent';
    public $aveReachPercentMetric = 'SUM(distinct_user_by_day * weight_national) / COUNT(DISTINCT date) * 100 / 70859907 AS ave_reach_percent';
}
