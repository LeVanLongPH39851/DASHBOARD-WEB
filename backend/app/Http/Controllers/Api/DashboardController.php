<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Services\DashboardService;

class DashboardController extends Controller {
    protected $dashboardService;

    public function __construct(DashboardService $dashboardService)
    {
        $this->dashboardService = $dashboardService;
    }

    public function index(Request $request)
    {
        $api = $this->dashboardService->dashboardService($request);
        return response()->json($api);
    }

    public function ratingBarChartChannelEventController(Request $request)
    {
        $api = $this->dashboardService->ratingBarChartChannelEventService($request);
        return response()->json($api);
    }
}
