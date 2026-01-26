<?php

namespace App\Repositories;
use App\Models\Rating;
use App\Metrics\RatingMetric;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rules\Dimensions;

class RatingRepository {
    protected $rating;
    protected $metric;

    public function __construct(Rating $rating, RatingMetric $metric)
    {
        $this->rating = $rating;
        $this->metric = $metric;
    }

    public function ratingNumber($fromDate, $toDate) {
        return (float) $this->rating::whereBetween('date', [$fromDate, $toDate])
        ->selectRaw($this->metric->ratingMetric)
        ->value($this->metric->ratingMetricName);
    }

    public function ratingPercentNumber($fromDate, $toDate) {
        return (float) $this->rating::whereBetween('date', [$fromDate, $toDate])
        ->selectRaw($this->metric->ratingPercentMetric)
        ->value($this->metric->ratingPercentMetricName);
    }

    public function ratingBarChartChannelEvent($fromDate, $toDate) {
        $dimensions = ['channel_name_tvd', 'event_category_name'];
        return $this->rating::query()
            ->whereBetween('date', [$fromDate, $toDate])
            ->select(
                $dimensions[0],
                $dimensions[1],
                DB::raw($this->metric->ratingMetric)
            )
            ->groupBy($dimensions)
            ->orderBy($dimensions[0])
            ->get();
    }

}
