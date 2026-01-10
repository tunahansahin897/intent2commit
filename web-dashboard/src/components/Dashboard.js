import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import './Dashboard.css';

function Dashboard({ data }) {
  const alignmentChartRef = useRef();
  const trendsChartRef = useRef();

  useEffect(() => {
    if (data) {
      renderAlignmentChart();
      renderTrendsChart();
    }
  }, [data]);

  const renderAlignmentChart = () => {
    const svg = d3.select(alignmentChartRef.current);
    svg.selectAll('*').remove();

    const width = 400;
    const height = 300;
    const margin = { top: 20, right: 20, bottom: 30, left: 40 };

    // Sample data
    const alignmentData = [
      { category: 'Excellent (90-100)', count: 45, color: '#4caf50' },
      { category: 'Good (75-89)', count: 30, color: '#8bc34a' },
      { category: 'Fair (60-74)', count: 15, color: '#ffc107' },
      { category: 'Poor (0-59)', count: 10, color: '#f44336' }
    ];

    const chart = svg
      .attr('width', width)
      .attr('height', height);

    const xScale = d3.scaleBand()
      .domain(alignmentData.map(d => d.category))
      .range([margin.left, width - margin.right])
      .padding(0.1);

    const yScale = d3.scaleLinear()
      .domain([0, d3.max(alignmentData, d => d.count)])
      .nice()
      .range([height - margin.bottom, margin.top]);

    chart.selectAll('rect')
      .data(alignmentData)
      .join('rect')
      .attr('x', d => xScale(d.category))
      .attr('y', d => yScale(d.count))
      .attr('width', xScale.bandwidth())
      .attr('height', d => yScale(0) - yScale(d.count))
      .attr('fill', d => d.color);

    chart.selectAll('text.label')
      .data(alignmentData)
      .join('text')
      .attr('class', 'label')
      .attr('x', d => xScale(d.category) + xScale.bandwidth() / 2)
      .attr('y', d => yScale(d.count) - 5)
      .attr('text-anchor', 'middle')
      .text(d => d.count);
  };

  const renderTrendsChart = () => {
    // Similar D3 line chart for trends
    const svg = d3.select(trendsChartRef.current);
    svg.selectAll('*').remove();

    // Line chart implementation
    const width = 600;
    const height = 300;
    
    svg.attr('width', width).attr('height', height);

    // Sample trend data
    const trendData = Array.from({ length: 30 }, (_, i) => ({
      day: i,
      score: 70 + Math.random() * 20
    }));

    const xScale = d3.scaleLinear()
      .domain([0, 29])
      .range([40, width - 20]);

    const yScale = d3.scaleLinear()
      .domain([0, 100])
      .range([height - 30, 20]);

    const line = d3.line()
      .x(d => xScale(d.day))
      .y(d => yScale(d.score))
      .curve(d3.curveMonotoneX);

    svg.append('path')
      .datum(trendData)
      .attr('fill', 'none')
      .attr('stroke', '#2196f3')
      .attr('stroke-width', 2)
      .attr('d', line);
  };

  const stats = {
    totalCommits: 156,
    avgAlignment: 82,
    excellentRate: 45,
    activeDevs: 8
  };

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <h1>Team Overview</h1>
        <p>Real-time intent alignment metrics</p>
      </header>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-value">{stats.totalCommits}</div>
          <div className="stat-label">Total Commits</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{stats.avgAlignment}%</div>
          <div className="stat-label">Avg Alignment</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{stats.excellentRate}%</div>
          <div className="stat-label">Excellent Rate</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{stats.activeDevs}</div>
          <div className="stat-label">Active Devs</div>
        </div>
      </div>

      <div className="charts-grid">
        <div className="chart-container">
          <h3>Alignment Distribution</h3>
          <svg ref={alignmentChartRef}></svg>
        </div>

        <div className="chart-container">
          <h3>30-Day Alignment Trend</h3>
          <svg ref={trendsChartRef}></svg>
        </div>
      </div>

      <div className="recent-activity">
        <h3>Recent Intents</h3>
        <table>
          <thead>
            <tr>
              <th>Intent</th>
              <th>Author</th>
              <th>Score</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Optimize database queries</td>
              <td>Developer A</td>
              <td className="score excellent">95</td>
              <td>2 hours ago</td>
            </tr>
            <tr>
              <td>Fix memory leak in auth</td>
              <td>Developer B</td>
              <td className="score good">78</td>
              <td>5 hours ago</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Dashboard;
