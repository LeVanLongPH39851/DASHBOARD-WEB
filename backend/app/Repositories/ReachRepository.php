<?php

namespace App\Repositories;
use App\Models\Reach;
use App\Metrics\ReachMetric;

class ReachRepository {
    protected $reach;
    protected $metric;

    public function __construct(Reach $reach, ReachMetric $metric)
    {
        $this->reach = $reach;
        $this->metric = $metric;
    }

    public function aveReachNumber($fromDate, $toDate) {
        return (float) $this->reach::whereBetween('date', [$fromDate, $toDate])
        ->where('level_target', '1')
        ->selectRaw($this->metric->aveReachMetric)
        ->value($this->metric->aveReachMetricName);
    }

    public function aveReachPercentNumber($fromDate, $toDate) {
        return (float) $this->reach::whereBetween('date', [$fromDate, $toDate])
        ->where('level_target', '1')
        ->selectRaw($this->metric->aveReachPercentMetric)
        ->value($this->metric->aveReachPercentMetricName);
    }
}
