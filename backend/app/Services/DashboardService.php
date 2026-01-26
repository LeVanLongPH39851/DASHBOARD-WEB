<?php

namespace App\Services;
use App\Repositories\RatingRepository;
use App\Repositories\ReachRepository;
use App\Metrics\RatingMetric;
use App\Metrics\ReachMetric;

class DashboardService {
    protected $ratingRepository;
    protected $reachRepository;
    protected $ratingMetric;
    protected $reachMetric;

    public function __construct(RatingRepository $ratingRepository, ReachRepository $reachRepository, RatingMetric $ratingMetric, ReachMetric $reachMetric) {
        $this->ratingRepository = $ratingRepository;
        $this->reachRepository = $reachRepository;
        $this->ratingMetric = $ratingMetric;
        $this->reachMetric = $reachMetric;
    }

    public function dashboardService($request) {
        $fromDate = $request->get('fromDate', '2025-12-21');
        $toDate = $request->get('toDate', '2025-12-21');
        $ratingNumber = $this->ratingRepository->ratingNumber($fromDate, $toDate);
        $ratingPercentNumber = $this->ratingRepository->ratingPercentNumber($fromDate, $toDate);
        $aveReachNumber = $this->reachRepository->aveReachNumber($fromDate, $toDate);
        $aveReachPercentNumber = $this->reachRepository->aveReachPercentNumber($fromDate, $toDate);

        return [
            'ratingNumber' => [
                $this->ratingMetric->ratingMetricName => $ratingNumber
            ],
            'ratingPercentNumber' => [
                $this->ratingMetric->ratingPercentMetricName => $ratingPercentNumber
            ],
            'aveReachNumber' => [
                $this->reachMetric->aveReachMetricName => $aveReachNumber
            ],
            'aveReachPercentNumber' => [
                $this->reachMetric->aveReachPercentMetricName => $aveReachPercentNumber
            ]
        ];
    }

    public function ratingBarChartChannelEventService($request) {
        $fromDate = $request->get('fromDate', '2025-12-21');
        $toDate = $request->get('toDate', '2025-12-21');
        $ratingBarChartChannelEvent = $this->ratingRepository->ratingBarChartChannelEvent($fromDate, $toDate);
        $dimensions = ['channel_name_tvd', 'event_category_name'];
        $grouped = $ratingBarChartChannelEvent
            ->groupBy($dimensions[0])
            ->map(fn ($items) =>
                $items->pluck($this->ratingMetric->ratingMetricName, $dimensions[1])
            );

        $labels = $grouped->keys()->values();

        $categories = $ratingBarChartChannelEvent
            ->pluck($dimensions[1])
            ->unique()
            ->values();

        $series = $categories->map(fn ($category) => [
            'name' => $category,
            'data' => $labels->map(
                fn ($channel) => (float) ($grouped[$channel][$category] ?? 0)
            )->values()->toArray(),
        ])->toArray();

        return [
            'ratingBarChartChannelEvent' => [
                'labels' => $labels->toArray(),
                'series' => $series
            ]
        ];
    }
}
