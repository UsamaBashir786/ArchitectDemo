// Chart Manager - Handles all chart-related functionality
class ChartManager {
    constructor() {
        this.charts = {};
        this.chartInstances = {};
    }
    
    // Initialize all charts on the current page
    initPageCharts(page) {
        this.destroyAllCharts(); // Clean up existing charts
        
        switch(page) {
            case 'dashboard':
                this.initDashboardCharts();
                break;
            case 'analytics':
                this.initAnalyticsCharts();
                break;
            case 'projects':
                this.initProjectProgressChart();
                break;
        }
    }
    
    // Initialize dashboard charts
    initDashboardCharts() {
        // Project Status Donut Chart
        this.initProjectStatusChart();
        
        // Revenue Trend Chart (if exists on dashboard)
        const revenueChartElement = document.getElementById('revenue-trend-chart');
        if (revenueChartElement) {
            this.initRevenueTrendChart();
        }
        
        // Client Activity Chart (if exists on dashboard)
        const activityChartElement = document.getElementById('client-activity-chart');
        if (activityChartElement) {
            this.initClientActivityChart();
        }
    }
    
    // Initialize project status donut chart
    initProjectStatusChart() {
        const container = document.getElementById('project-chart');
        if (!container) return;
        
        // Calculate project statistics
        const stats = this.calculateProjectStats();
        
        const options = {
            series: stats.series,
            chart: {
                type: 'donut',
                height: 350,
                fontFamily: 'Inter, sans-serif',
                animations: {
                    enabled: true,
                    speed: 800,
                    animateGradually: {
                        enabled: true,
                        delay: 150
                    },
                    dynamicAnimation: {
                        enabled: true,
                        speed: 350
                    }
                }
            },
            colors: ['#10b981', '#3b82f6', '#ef4444', '#8b5cf6', '#f59e0b'],
            labels: stats.labels,
            legend: {
                position: 'bottom',
                horizontalAlign: 'center',
                fontSize: '12px',
                fontFamily: 'Inter, sans-serif',
                markers: {
                    width: 8,
                    height: 8,
                    radius: 4
                },
                itemMargin: {
                    horizontal: 10,
                    vertical: 5
                }
            },
            plotOptions: {
                pie: {
                    donut: {
                        size: '65%',
                        labels: {
                            show: true,
                            name: {
                                show: true,
                                fontSize: '14px',
                                fontFamily: 'Inter, sans-serif',
                                fontWeight: 600,
                                color: '#6b7280'
                            },
                            value: {
                                show: true,
                                fontSize: '28px',
                                fontFamily: 'Inter, sans-serif',
                                fontWeight: 700,
                                color: '#111827',
                                formatter: function(val) {
                                    return val;
                                }
                            },
                            total: {
                                show: true,
                                label: 'Total Projects',
                                fontSize: '14px',
                                fontFamily: 'Inter, sans-serif',
                                fontWeight: 600,
                                color: '#6b7280',
                                formatter: function(w) {
                                    return w.globals.seriesTotals.reduce((a, b) => a + b, 0);
                                }
                            }
                        }
                    }
                }
            },
            dataLabels: {
                enabled: false
            },
            stroke: {
                width: 2,
                colors: ['#fff']
            },
            tooltip: {
                y: {
                    formatter: function(val, { seriesIndex, w }) {
                        const total = w.globals.seriesTotals.reduce((a, b) => a + b, 0);
                        const percentage = ((val / total) * 100).toFixed(1);
                        return `${val} projects (${percentage}%)`;
                    }
                }
            },
            responsive: [{
                breakpoint: 480,
                options: {
                    chart: {
                        width: '100%'
                    },
                    legend: {
                        position: 'bottom'
                    }
                }
            }]
        };
        
        const chart = new ApexCharts(container, options);
        chart.render();
        this.chartInstances.projectStatus = chart;
    }
    
    // Initialize analytics charts
    initAnalyticsCharts() {
        this.initRevenueChart();
        this.initClientGrowthChart();
        this.initProjectTimelineChart();
        this.initFeedbackAnalysisChart();
    }
    
    // Initialize revenue chart
    initRevenueChart() {
        const container = document.getElementById('revenue-chart');
        if (!container) return;
        
        // Generate demo revenue data
        const revenueData = this.generateRevenueData();
        
        const options = {
            series: [{
                name: 'Revenue',
                data: revenueData
            }],
            chart: {
                height: 320,
                type: 'area',
                fontFamily: 'Inter, sans-serif',
                toolbar: {
                    show: true,
                    tools: {
                        download: true,
                        selection: true,
                        zoom: true,
                        zoomin: true,
                        zoomout: true,
                        pan: true,
                        reset: true
                    }
                },
                animations: {
                    enabled: true,
                    easing: 'easeinout',
                    speed: 800
                }
            },
            colors: ['#3b82f6'],
            dataLabels: {
                enabled: false
            },
            stroke: {
                curve: 'smooth',
                width: 3,
                lineCap: 'round'
            },
            fill: {
                type: 'gradient',
                gradient: {
                    shadeIntensity: 1,
                    opacityFrom: 0.7,
                    opacityTo: 0.2,
                    stops: [0, 90, 100]
                }
            },
            grid: {
                borderColor: '#e5e7eb',
                strokeDashArray: 4,
                padding: {
                    top: 20,
                    right: 20,
                    bottom: 0,
                    left: 20
                }
            },
            xaxis: {
                categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
                axisBorder: {
                    show: false
                },
                axisTicks: {
                    show: false
                },
                tooltip: {
                    enabled: false
                },
                labels: {
                    style: {
                        colors: '#6b7280',
                        fontSize: '12px',
                        fontFamily: 'Inter, sans-serif'
                    }
                }
            },
            yaxis: {
                labels: {
                    formatter: function(value) {
                        return '$' + (value / 1000) + 'k';
                    },
                    style: {
                        colors: '#6b7280',
                        fontSize: '12px',
                        fontFamily: 'Inter, sans-serif'
                    }
                }
            },
            tooltip: {
                theme: 'light',
                style: {
                    fontSize: '12px',
                    fontFamily: 'Inter, sans-serif'
                },
                y: {
                    formatter: function(value) {
                        return '$' + value.toLocaleString();
                    }
                },
                marker: {
                    show: true
                }
            },
            markers: {
                size: 5,
                colors: ['#3b82f6'],
                strokeColors: '#fff',
                strokeWidth: 2,
                hover: {
                    size: 7
                }
            }
        };
        
        const chart = new ApexCharts(container, options);
        chart.render();
        this.chartInstances.revenue = chart;
    }
    
    // Initialize client growth chart
    initClientGrowthChart() {
        const container = document.getElementById('client-growth-chart');
        if (!container) return;
        
        const growthData = this.generateClientGrowthData();
        
        const options = {
            series: [{
                name: 'Total Clients',
                data: growthData.total
            }, {
                name: 'New Clients',
                data: growthData.new
            }],
            chart: {
                height: 320,
                type: 'line',
                fontFamily: 'Inter, sans-serif',
                toolbar: {
                    show: true
                },
                animations: {
                    enabled: true,
                    easing: 'linear',
                    speed: 800
                }
            },
            colors: ['#10b981', '#3b82f6'],
            stroke: {
                width: 3,
                curve: 'smooth',
                lineCap: 'round'
            },
            dataLabels: {
                enabled: false
            },
            grid: {
                borderColor: '#e5e7eb',
                strokeDashArray: 4,
                padding: {
                    top: 20,
                    right: 20,
                    bottom: 0,
                    left: 20
                }
            },
            xaxis: {
                categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
                axisBorder: {
                    show: false
                },
                axisTicks: {
                    show: false
                },
                labels: {
                    style: {
                        colors: '#6b7280',
                        fontSize: '12px',
                        fontFamily: 'Inter, sans-serif'
                    }
                }
            },
            yaxis: {
                labels: {
                    style: {
                        colors: '#6b7280',
                        fontSize: '12px',
                        fontFamily: 'Inter, sans-serif'
                    }
                }
            },
            tooltip: {
                theme: 'light',
                shared: true,
                intersect: false,
                style: {
                    fontSize: '12px',
                    fontFamily: 'Inter, sans-serif'
                }
            },
            markers: {
                size: 5,
                strokeWidth: 2,
                hover: {
                    size: 7
                }
            },
            legend: {
                position: 'top',
                horizontalAlign: 'right',
                fontSize: '12px',
                fontFamily: 'Inter, sans-serif'
            }
        };
        
        const chart = new ApexCharts(container, options);
        chart.render();
        this.chartInstances.clientGrowth = chart;
    }
    
    // Initialize project timeline chart
    initProjectTimelineChart() {
        const container = document.getElementById('project-timeline-chart');
        if (!container) return;
        
        const timelineData = this.generateProjectTimelineData();
        
        const options = {
            series: timelineData.series,
            chart: {
                height: 350,
                type: 'rangeBar',
                fontFamily: 'Inter, sans-serif',
                toolbar: {
                    show: true
                }
            },
            plotOptions: {
                bar: {
                    horizontal: true,
                    barHeight: '60%',
                    borderRadius: 6,
                    distributed: false
                }
            },
            colors: ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'],
            dataLabels: {
                enabled: true,
                formatter: function(val, opts) {
                    return opts.w.config.series[opts.seriesIndex].data[opts.dataPointIndex].x;
                },
                style: {
                    colors: ['#fff'],
                    fontSize: '11px',
                    fontWeight: 'normal'
                }
            },
            grid: {
                borderColor: '#e5e7eb',
                padding: {
                    top: 0,
                    right: 20,
                    bottom: 0,
                    left: 120
                }
            },
            xaxis: {
                type: 'datetime',
                labels: {
                    style: {
                        colors: '#6b7280',
                        fontSize: '12px'
                    },
                    datetimeFormatter: {
                        month: 'MMM \'yy'
                    }
                }
            },
            yaxis: {
                labels: {
                    style: {
                        colors: '#6b7280',
                        fontSize: '12px'
                    }
                }
            },
            tooltip: {
                custom: function({ series, seriesIndex, dataPointIndex, w }) {
                    const data = w.config.series[seriesIndex].data[dataPointIndex];
                    const start = new Date(data.y[0]).toLocaleDateString();
                    const end = new Date(data.y[1]).toLocaleDateString();
                    const status = data.meta.status;
                    const progress = data.meta.progress;
                    
                    return `
                        <div class="p-2 bg-white border border-gray-200 rounded-lg shadow-lg">
                            <div class="font-semibold text-gray-800">${data.x}</div>
                            <div class="text-sm text-gray-600 mt-1">${start} - ${end}</div>
                            <div class="flex items-center mt-2">
                                <span class="status-badge ${status === 'completed' ? 'status-active' : status === 'in-progress' ? 'status-pending' : 'status-delayed'}">${status}</span>
                                <span class="ml-2 text-sm text-gray-600">${progress}% complete</span>
                            </div>
                        </div>
                    `;
                }
            }
        };
        
        const chart = new ApexCharts(container, options);
        chart.render();
        this.chartInstances.projectTimeline = chart;
    }
    
    // Initialize feedback analysis chart
    initFeedbackAnalysisChart() {
        const container = document.getElementById('feedback-analysis-chart');
        if (!container) return;
        
        const feedbackData = this.calculateFeedbackStats();
        
        const options = {
            series: [{
                name: 'Rating Distribution',
                data: feedbackData.distribution
            }],
            chart: {
                height: 300,
                type: 'bar',
                fontFamily: 'Inter, sans-serif',
                toolbar: {
                    show: false
                }
            },
            colors: ['#f59e0b'],
            plotOptions: {
                bar: {
                    borderRadius: 6,
                    columnWidth: '60%',
                    distributed: true
                }
            },
            dataLabels: {
                enabled: true,
                formatter: function(val) {
                    return val;
                },
                offsetY: -20,
                style: {
                    fontSize: '12px',
                    colors: ["#6b7280"]
                }
            },
            grid: {
                borderColor: '#e5e7eb',
                padding: {
                    top: 0,
                    right: 20,
                    bottom: 0,
                    left: 20
                }
            },
            xaxis: {
                categories: ['1 Star', '2 Stars', '3 Stars', '4 Stars', '5 Stars'],
                labels: {
                    style: {
                        colors: '#6b7280',
                        fontSize: '12px'
                    }
                }
            },
            yaxis: {
                labels: {
                    style: {
                        colors: '#6b7280',
                        fontSize: '12px'
                    }
                }
            },
            tooltip: {
                theme: 'light',
                y: {
                    formatter: function(val) {
                        return val + ' feedbacks';
                    }
                }
            }
        };
        
        const chart = new ApexCharts(container, options);
        chart.render();
        this.chartInstances.feedbackAnalysis = chart;
    }
    
    // Initialize project progress chart (for projects page)
    initProjectProgressChart() {
        const container = document.getElementById('project-progress-chart');
        if (!container) return;
        
        const progressData = this.getProjectProgressData();
        
        const options = {
            series: [{
                name: 'Progress',
                data: progressData
            }],
            chart: {
                height: 400,
                type: 'bar',
                fontFamily: 'Inter, sans-serif',
                toolbar: {
                    show: true
                }
            },
            plotOptions: {
                bar: {
                    horizontal: true,
                    borderRadius: 8,
                    columnWidth: '60%',
                    dataLabels: {
                        position: 'top'
                    }
                }
            },
            colors: ['#3b82f6'],
            dataLabels: {
                enabled: true,
                formatter: function(val) {
                    return val + '%';
                },
                offsetX: 20,
                style: {
                    fontSize: '12px',
                    colors: ["#6b7280"]
                }
            },
            grid: {
                borderColor: '#e5e7eb',
                padding: {
                    top: 0,
                    right: 40,
                    bottom: 0,
                    left: 160
                }
            },
            xaxis: {
                categories: progressData.map(d => d.x),
                max: 100,
                labels: {
                    formatter: function(val) {
                        return val + '%';
                    },
                    style: {
                        colors: '#6b7280',
                        fontSize: '12px'
                    }
                }
            },
            yaxis: {
                labels: {
                    style: {
                        colors: '#6b7280',
                        fontSize: '12px'
                    }
                }
            },
            tooltip: {
                theme: 'light',
                y: {
                    formatter: function(val, { dataPointIndex, w }) {
                        const project = w.config.series[0].data[dataPointIndex];
                        return `
                            <div class="text-left">
                                <div class="font-semibold">${project.x}</div>
                                <div class="text-sm">Progress: ${val}%</div>
                                <div class="text-sm">Status: ${project.meta.status}</div>
                                <div class="text-sm">Due: ${project.meta.dueDate}</div>
                            </div>
                        `;
                    }
                }
            }
        };
        
        const chart = new ApexCharts(container, options);
        chart.render();
        this.chartInstances.projectProgress = chart;
    }
    
    // Initialize revenue trend chart (for dashboard)
    initRevenueTrendChart() {
        const container = document.getElementById('revenue-trend-chart');
        if (!container) return;
        
        const trendData = this.generateRevenueTrendData();
        
        const options = {
            series: [{
                name: 'Revenue',
                data: trendData
            }],
            chart: {
                height: 250,
                type: 'line',
                fontFamily: 'Inter, sans-serif',
                toolbar: {
                    show: false
                },
                sparkline: {
                    enabled: true
                }
            },
            colors: ['#10b981'],
            stroke: {
                curve: 'smooth',
                width: 3
            },
            fill: {
                type: 'gradient',
                gradient: {
                    shadeIntensity: 1,
                    opacityFrom: 0.7,
                    opacityTo: 0.2
                }
            },
            markers: {
                size: 4
            },
            xaxis: {
                categories: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
                labels: {
                    show: false
                },
                axisBorder: {
                    show: false
                },
                axisTicks: {
                    show: false
                }
            },
            yaxis: {
                show: false
            },
            tooltip: {
                theme: 'dark',
                y: {
                    formatter: function(val) {
                        return '$' + val.toLocaleString();
                    }
                }
            }
        };
        
        const chart = new ApexCharts(container, options);
        chart.render();
        this.chartInstances.revenueTrend = chart;
    }
    
    // Initialize client activity chart (for dashboard)
    initClientActivityChart() {
        const container = document.getElementById('client-activity-chart');
        if (!container) return;
        
        const activityData = this.generateClientActivityData();
        
        const options = {
            series: [{
                name: 'Activity',
                data: activityData
            }],
            chart: {
                height: 250,
                type: 'area',
                fontFamily: 'Inter, sans-serif',
                toolbar: {
                    show: false
                }
            },
            colors: ['#8b5cf6'],
            stroke: {
                curve: 'smooth',
                width: 3
            },
            fill: {
                type: 'gradient',
                gradient: {
                    shadeIntensity: 1,
                    opacityFrom: 0.7,
                    opacityTo: 0.2
                }
            },
            xaxis: {
                categories: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
                labels: {
                    style: {
                        colors: '#6b7280',
                        fontSize: '11px'
                    }
                }
            },
            yaxis: {
                labels: {
                    style: {
                        colors: '#6b7280',
                        fontSize: '11px'
                    }
                }
            },
            grid: {
                borderColor: '#e5e7eb',
                strokeDashArray: 3,
                padding: {
                    top: 0,
                    right: 10,
                    bottom: 0,
                    left: 10
                }
            },
            tooltip: {
                theme: 'light',
                y: {
                    formatter: function(val) {
                        return val + ' activities';
                    }
                }
            }
        };
        
        const chart = new ApexCharts(container, options);
        chart.render();
        this.chartInstances.clientActivity = chart;
    }
    
    // Update all charts with fresh data
    updateAllCharts() {
        Object.keys(this.chartInstances).forEach(chartName => {
            this.updateChart(chartName);
        });
    }
    
    // Update specific chart
    updateChart(chartName) {
        const chart = this.chartInstances[chartName];
        if (!chart) return;
        
        switch(chartName) {
            case 'projectStatus':
                const stats = this.calculateProjectStats();
                chart.updateSeries(stats.series);
                chart.updateOptions({
                    labels: stats.labels
                });
                break;
                
            case 'revenue':
                const revenueData = this.generateRevenueData();
                chart.updateSeries([{
                    data: revenueData
                }]);
                break;
                
            case 'clientGrowth':
                const growthData = this.generateClientGrowthData();
                chart.updateSeries([{
                    name: 'Total Clients',
                    data: growthData.total
                }, {
                    name: 'New Clients',
                    data: growthData.new
                }]);
                break;
                
            case 'feedbackAnalysis':
                const feedbackData = this.calculateFeedbackStats();
                chart.updateSeries([{
                    data: feedbackData.distribution
                }]);
                break;
                
            case 'projectProgress':
                const progressData = this.getProjectProgressData();
                chart.updateSeries([{
                    data: progressData
                }]);
                break;
        }
    }
    
    // Calculate project statistics
    calculateProjectStats() {
        const projects = dataManager.data.projects;
        
        const statusCounts = {
            'completed': 0,
            'in-progress': 0,
            'delayed': 0,
            'planning': 0,
            'on-hold': 0
        };
        
        projects.forEach(project => {
            if (statusCounts.hasOwnProperty(project.status)) {
                statusCounts[project.status]++;
            } else {
                statusCounts[project.status] = 1;
            }
        });
        
        // Filter out zero counts
        const labels = [];
        const series = [];
        
        Object.entries(statusCounts).forEach(([status, count]) => {
            if (count > 0) {
                labels.push(this.formatStatusLabel(status));
                series.push(count);
            }
        });
        
        return { labels, series };
    }
    
    // Format status label for display
    formatStatusLabel(status) {
        const labels = {
            'completed': 'Completed',
            'in-progress': 'In Progress',
            'delayed': 'Delayed',
            'planning': 'Planning',
            'on-hold': 'On Hold'
        };
        return labels[status] || status;
    }
    
    // Generate revenue data
    generateRevenueData() {
        // Base revenue with some variation
        const baseRevenue = 45000;
        const variation = 0.3; // 30% variation
        
        return Array.from({length: 12}, (_, i) => {
            const monthFactor = 1 + (i * 0.08); // 8% growth per month
            const randomFactor = 1 + (Math.random() * variation * 2 - variation);
            return Math.round(baseRevenue * monthFactor * randomFactor);
        });
    }
    
    // Generate client growth data
    generateClientGrowthData() {
        let total = 12;
        const totalData = [];
        const newData = [];
        
        for (let i = 0; i < 12; i++) {
            const newClients = Math.floor(Math.random() * 5) + 2; // 2-6 new clients per month
            newData.push(newClients);
            total += newClients;
            totalData.push(total);
        }
        
        return { total: totalData, new: newData };
    }
    
    // Generate project timeline data
    generateProjectTimelineData() {
        const projects = dataManager.data.projects.slice(0, 8); // Show only 8 projects
        
        const series = [{
            data: projects.map(project => {
                // Convert due date to timeline format
                const startDate = new Date();
                const dueDate = new Date(project.dueDate);
                
                // If due date is in past, adjust start date
                if (dueDate < startDate) {
                    startDate.setMonth(startDate.getMonth() - 3);
                } else {
                    startDate.setMonth(dueDate.getMonth() - 3);
                }
                
                return {
                    x: project.name,
                    y: [
                        startDate.getTime(),
                        dueDate.getTime()
                    ],
                    meta: {
                        status: project.status,
                        progress: project.progress
                    }
                };
            })
        }];
        
        return { series };
    }
    
    // Calculate feedback statistics
    calculateFeedbackStats() {
        const feedback = dataManager.data.feedback;
        
        // Count ratings 1-5
        const distribution = [0, 0, 0, 0, 0];
        
        feedback.forEach(f => {
            if (f.rating >= 1 && f.rating <= 5) {
                distribution[f.rating - 1]++;
            }
        });
        
        // Calculate average rating
        const totalRatings = feedback.length;
        const sumRatings = feedback.reduce((sum, f) => sum + f.rating, 0);
        const averageRating = totalRatings > 0 ? (sumRatings / totalRatings).toFixed(1) : 0;
        
        return {
            distribution,
            averageRating,
            totalRatings
        };
    }
    
    // Get project progress data
    getProjectProgressData() {
        return dataManager.data.projects.map(project => ({
            x: project.name,
            y: project.progress,
            meta: {
                status: project.status,
                dueDate: new Date(project.dueDate).toLocaleDateString()
            }
        }));
    }
    
    // Generate revenue trend data (for dashboard sparkline)
    generateRevenueTrendData() {
        return Array.from({length: 4}, () => 
            Math.floor(Math.random() * 20000) + 40000
        );
    }
    
    // Generate client activity data
    generateClientActivityData() {
        return Array.from({length: 7}, () => 
            Math.floor(Math.random() * 15) + 5
        );
    }
    
    // Animate chart update
    animateChartUpdate(chartName) {
        const chart = this.chartInstances[chartName];
        if (!chart) return;
        
        // Add animation class to chart container
        const container = chart.el;
        container.classList.add('chart-updating');
        
        // Remove class after animation
        setTimeout(() => {
            container.classList.remove('chart-updating');
        }, 800);
    }
    
    // Export chart as image
    exportChart(chartName) {
        const chart = this.chartInstances[chartName];
        if (!chart) {
            dataManager.notyf.error('Chart not found');
            return;
        }
        
        chart.dataURI().then(({ imgURI, blob }) => {
            const link = document.createElement('a');
            link.href = imgURI;
            link.download = `${chartName}-chart.png`;
            link.click();
            dataManager.notyf.success('Chart exported successfully!');
        }).catch(error => {
            console.error('Error exporting chart:', error);
            dataManager.notyf.error('Failed to export chart');
        });
    }
    
    // Print chart
    printChart(chartName) {
        const chart = this.chartInstances[chartName];
        if (!chart) {
            dataManager.notyf.error('Chart not found');
            return;
        }
        
        chart.dataURI().then(({ imgURI }) => {
            const printWindow = window.open('');
            printWindow.document.write(`
                <html>
                    <head>
                        <title>Print Chart</title>
                        <style>
                            body { 
                                margin: 0; 
                                padding: 20px; 
                                font-family: 'Inter', sans-serif; 
                            }
                            .chart-container { 
                                max-width: 800px; 
                                margin: 0 auto; 
                            }
                            .chart-title { 
                                text-align: center; 
                                margin-bottom: 20px; 
                                color: #111827; 
                                font-size: 24px; 
                                font-weight: 600; 
                            }
                            .chart-image { 
                                width: 100%; 
                                height: auto; 
                            }
                            @media print {
                                @page { margin: 0; }
                                body { padding: 0; }
                            }
                        </style>
                    </head>
                    <body>
                        <div class="chart-container">
                            <h1 class="chart-title">${this.getChartTitle(chartName)}</h1>
                            <img src="${imgURI}" class="chart-image" alt="${chartName} chart">
                        </div>
                        <script>
                            window.onload = function() {
                                window.print();
                                setTimeout(function() {
                                    window.close();
                                }, 100);
                            }
                        </script>
                    </body>
                </html>
            `);
            printWindow.document.close();
        });
    }
    
    // Get chart title
    getChartTitle(chartName) {
        const titles = {
            'projectStatus': 'Project Status Distribution',
            'revenue': 'Monthly Revenue Analysis',
            'clientGrowth': 'Client Growth Trend',
            'projectTimeline': 'Project Timeline',
            'feedbackAnalysis': 'Feedback Rating Distribution',
            'projectProgress': 'Project Progress Overview',
            'revenueTrend': 'Revenue Trend',
            'clientActivity': 'Client Activity'
        };
        return titles[chartName] || 'Chart';
    }
    
    // Resize all charts
    resizeAllCharts() {
        Object.values(this.chartInstances).forEach(chart => {
            if (chart && typeof chart.resize === 'function') {
                setTimeout(() => chart.resize(), 100);
            }
        });
    }
    
    // Destroy all charts
    destroyAllCharts() {
        Object.values(this.chartInstances).forEach(chart => {
            if (chart && typeof chart.destroy === 'function') {
                chart.destroy();
            }
        });
        this.chartInstances = {};
    }
    
    // Add CSS for chart animations
    addChartStyles() {
        if (!document.getElementById('chart-styles')) {
            const style = document.createElement('style');
            style.id = 'chart-styles';
            style.textContent = `
                .apexcharts-tooltip {
                    border-radius: 0.5rem !important;
                    border: 1px solid #e5e7eb !important;
                    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06) !important;
                }
                
                .apexcharts-tooltip-title {
                    background: #f9fafb !important;
                    border-bottom: 1px solid #e5e7eb !important;
                    font-weight: 600 !important;
                    font-size: 12px !important;
                }
                
                .chart-updating {
                    animation: pulse 0.8s ease-in-out;
                }
                
                @keyframes pulse {
                    0% { opacity: 1; }
                    50% { opacity: 0.7; }
                    100% { opacity: 1; }
                }
                
                .apexcharts-legend {
                    padding: 0 !important;
                }
                
                .apexcharts-menu {
                    border: 1px solid #e5e7eb !important;
                    border-radius: 0.5rem !important;
                    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06) !important;
                }
                
                .apexcharts-menu-item:hover {
                    background-color: #f3f4f6 !important;
                }
            `;
            document.head.appendChild(style);
        }
    }
    
    // Initialize chart controls
    initChartControls() {
        // Add export and print buttons to chart toolbars
        setTimeout(() => {
            this.addChartControlButtons();
        }, 1000);
    }
    
    // Add control buttons to charts
    addChartControlButtons() {
        Object.keys(this.chartInstances).forEach(chartName => {
            const chart = this.chartInstances[chartName];
            if (chart && chart.el) {
                const toolbar = chart.el.querySelector('.apexcharts-toolbar');
                if (toolbar) {
                    this.addCustomControls(toolbar, chartName);
                }
            }
        });
    }
    
    // Add custom controls to chart toolbar
    addCustomControls(toolbar, chartName) {
        // Check if controls already exist
        if (toolbar.querySelector('.custom-chart-controls')) {
            return;
        }
        
        const controlsDiv = document.createElement('div');
        controlsDiv.className = 'custom-chart-controls flex items-center space-x-2';
        
        // Export button
        const exportBtn = document.createElement('button');
        exportBtn.className = 'text-gray-500 hover:text-gray-700 p-1';
        exportBtn.title = 'Export Chart';
        exportBtn.innerHTML = '<i data-lucide="download" class="w-4 h-4"></i>';
        exportBtn.onclick = () => this.exportChart(chartName);
        
        // Print button
        const printBtn = document.createElement('button');
        printBtn.className = 'text-gray-500 hover:text-gray-700 p-1';
        printBtn.title = 'Print Chart';
        printBtn.innerHTML = '<i data-lucide="printer" class="w-4 h-4"></i>';
        printBtn.onclick = () => this.printChart(chartName);
        
        // Refresh button
        const refreshBtn = document.createElement('button');
        refreshBtn.className = 'text-gray-500 hover:text-gray-700 p-1';
        refreshBtn.title = 'Refresh Data';
        refreshBtn.innerHTML = '<i data-lucide="refresh-cw" class="w-4 h-4"></i>';
        refreshBtn.onclick = () => {
            this.updateChart(chartName);
            this.animateChartUpdate(chartName);
            dataManager.notyf.success('Chart data refreshed!');
        };
        
        controlsDiv.appendChild(exportBtn);
        controlsDiv.appendChild(printBtn);
        controlsDiv.appendChild(refreshBtn);
        toolbar.appendChild(controlsDiv);
        
        // Update icons
        lucide.createIcons();
    }
}

// Create global instance
const chartManager = new ChartManager();

// Add chart styles when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    chartManager.addChartStyles();
});

// Handle window resize
let resizeTimeout;
window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
        chartManager.resizeAllCharts();
    }, 250);
});