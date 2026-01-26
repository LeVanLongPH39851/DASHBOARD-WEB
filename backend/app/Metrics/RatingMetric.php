<?php
namespace App\Metrics;

class RatingMetric {
    public $ratingMetricName = 'rating';
    public $ratingMetric = 'SUM(duration_view_program * weight_national) * 1.9 / 60 / (18 * 60 * COUNT(DISTINCT date)) AS rating';

    public $ratingPercentMetricName = 'rating_percent';
    public $ratingPercentMetric = 'SUM(duration_view_program * weight_national) * 1.9 * 100 / (18 * 60 * COUNT(DISTINCT date) * 60 * 70859907) AS rating_percent';
}
