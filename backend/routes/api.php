<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use App\Http\Controllers\Api\DashboardController;

Route::get('/dashboard', [DashboardController::class, 'index']);
Route::get('/dashboard/rating-bar-chart-channel-event', [DashboardController::class, 'ratingBarChartChannelEventController']);
