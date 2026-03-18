import React, { useState } from 'react';

const LineChart = ({ config, customWidth, customPadding }) => {
  const chartHeight = 200;
  const chartWidth = customWidth || 385;
  const defaultPadding = { top: 40, right: 150, bottom: 45, left: 50 };
  const padding = customPadding || defaultPadding;
  const innerWidth = chartWidth - padding.left - padding.right;
  const innerHeight = chartHeight - padding.top - padding.bottom;

  const lines = config.lines || [];
  
  const allValues = lines.flatMap(line => line.dataPoints.map(p => p.value));
  const maxValue = Math.max(...allValues, 0);
  const yMax = Math.ceil(maxValue * 1.1 / 100) * 100;
  
  const years = lines[0]?.dataPoints.map(p => p.year) || [];
  const xStep = years.length > 1 ? innerWidth / (years.length - 1) : 0;

  const colors = ['#0077B0', '#E36C2E', '#4CAF50', '#9C27B0', '#FF9800', '#00BCD4', '#F44336', '#795548'];

  return (
    <div className="bg-white" style={{ borderRadius: '4px', border: '1px solid #E1EAEB' }}>
      <svg width={chartWidth} height={chartHeight} style={{ fontFamily: 'Work Sans, sans-serif' }}>
        <text x={padding.left} y={25} textAnchor="start" fontSize="12" fontWeight="600" fill="#333">
          {config.title}
        </text>

        {[0, 0.25, 0.5, 0.75, 1].map((ratio) => {
          const val = Math.round(yMax * ratio);
          const y = padding.top + innerHeight - (ratio * innerHeight);
          return (
            <g key={ratio}>
              <line x1={padding.left} y1={y} x2={padding.left + innerWidth} y2={y} stroke="#E5E5E5" strokeWidth="1" />
              <text x={padding.left - 10} y={y + 4} textAnchor="end" fontSize="10" fill="#666">{val}</text>
            </g>
          );
        })}

        {years.map((year, idx) => {
          // Only show even years starting from 2016
          if (year === "2015" || parseInt(year) % 2 !== 0) return null;
          const x = padding.left + idx * xStep;
          return (
            <text key={idx} x={x} y={padding.top + innerHeight + 20} textAnchor="middle" fontSize="10" fill="#666">
              {year}
            </text>
          );
        })}

        {lines.map((line, lineIdx) => {
          const points = line.dataPoints.map((point, idx) => {
            const x = padding.left + idx * xStep;
            const y = padding.top + innerHeight - (point.value / yMax) * innerHeight;
            return `${x},${y}`;
          }).join(' ');

          const color = line.color || colors[lineIdx % colors.length];

          return (
            <g key={lineIdx}>
              <polyline points={points} fill="none" stroke={color} strokeWidth="1.5" />
              {line.dataPoints.map((point, idx) => {
                const x = padding.left + idx * xStep;
                const y = padding.top + innerHeight - (point.value / yMax) * innerHeight;
                
                // Determine if label should be above or below the point
                const isNearTop = y < (padding.top + innerHeight * 0.3);
                const labelY = isNearTop ? y + 15 : y - 8;
                
                return (
                  <g key={idx}>
                    <circle cx={x} cy={y} r="3" fill={color} />
                    {line.showDataLabels && (
                      <text 
                        x={x} 
                        y={labelY} 
                        textAnchor="middle" 
                        fontSize="9" 
                        fontWeight="600"
                        fill="#333"
                      >
                        {point.value}
                      </text>
                    )}
                  </g>
                );
              })}
            </g>
          );
        })}

        {lines.map((line, idx) => {
          if (line.showLegend === false) return null; // Skip legend if showLegend is false
          const color = line.color || colors[idx % colors.length];
          const legendY = padding.top + idx * 18;
          return (
            <g key={idx}>
              <line x1={padding.left + innerWidth + 10} y1={legendY} x2={padding.left + innerWidth + 25} y2={legendY} stroke={color} strokeWidth="2" />
              <text x={padding.left + innerWidth + 30} y={legendY + 3} fontSize="8" fill="#333">{line.label}</text>
            </g>
          );
        })}

        <line x1={padding.left} y1={padding.top} x2={padding.left} y2={padding.top + innerHeight} stroke="#666" strokeWidth="1" />
        <line x1={padding.left} y1={padding.top + innerHeight} x2={padding.left + innerWidth} y2={padding.top + innerHeight} stroke="#666" strokeWidth="1" />
      </svg>
    </div>
  );
};

const HorizontalDemographicChart = ({ config, customWidth, facilityLegendLabel }) => {
  const chartWidth = customWidth || 385;
  const leftMargin = 8;
  const labelWidth = 105;
  const rightPadding = 72;
  const barAreaWidth = chartWidth - leftMargin - labelWidth - rightPadding;
  const barHeight = 7;
  const rowHeight = 26;
  const maxPercentage = config.maxPercentage || 100;
  const categories = config.categories || [];

  // wrap title across up to 2 lines
  const titleWords = config.title.split(' ');
  const titleLines: string[] = [];
  let currentTitleLine: string[] = [];
  titleWords.forEach(word => {
    const test = [...currentTitleLine, word].join(' ');
    if (test.length * 6.5 < chartWidth - leftMargin * 2 || currentTitleLine.length === 0) {
      currentTitleLine.push(word);
    } else {
      titleLines.push(currentTitleLine.join(' '));
      currentTitleLine = [word];
    }
  });
  if (currentTitleLine.length > 0) titleLines.push(currentTitleLine.join(' '));

  const subtitleOffset = config.showSubtitle && config.subtitleText ? 12 : 0;
  const topPadding = 20 + titleLines.length * 14 + subtitleOffset + 6; // title + optional subtitle
  const chartHeight = topPadding + categories.length * rowHeight + 8;

  return (
    <div className="bg-white" style={{ borderRadius: '4px', border: '1px solid #E1EAEB' }}>
      <svg width={chartWidth} height={chartHeight} style={{ fontFamily: 'Work Sans, sans-serif' }}>
        {titleLines.map((line, i) => (
          <text key={i} x={leftMargin} y={16 + i * 14} fontSize="12" fontWeight="600" fill="#333">{line}</text>
        ))}

        {config.showSubtitle && config.subtitleText && (
          <text x={leftMargin} y={16 + titleLines.length * 14} fontSize="8" fill="#666" fontStyle="italic">
            {config.subtitleText}{config.includeFacilityInSubtitle ? ` at ${facilityLegendLabel}` : ''}
          </text>
        )}

        {/* Grid lines */}
        {[0, 25, 50, 75, 100].map(pct => {
          if (pct > maxPercentage) return null;
          const x = leftMargin + labelWidth + (pct / maxPercentage) * barAreaWidth;
          return (
            <line key={pct} x1={x} y1={topPadding - 4} x2={x} y2={topPadding + categories.length * rowHeight} stroke="#E5E5E5" strokeWidth="1" />
          );
        })}

        {categories.map((cat, idx) => {
          const y = topPadding + idx * rowHeight;
          const swWidth = Math.max(0, (cat.systemwidePercent / maxPercentage) * barAreaWidth);
          const facWidth = Math.max(0, (cat.facilityPercent / maxPercentage) * barAreaWidth);
          const barX = leftMargin + labelWidth;

          return (
            <g key={idx}>
              <text x={leftMargin + labelWidth - 4} y={y + barHeight * 2 + 1} textAnchor="end" fontSize="8" fontWeight="600" fill="#333">{cat.label}</text>

              <rect x={barX} y={y} width={swWidth} height={barHeight} fill="#B8D4E0" stroke="#46676F" strokeWidth="0.5" />
              <text x={barX + swWidth + 3} y={y + barHeight - 1} fontSize="7.5" fontWeight="600" fill="#4C5E61">{cat.systemwidePercent}% ({cat.systemwideCount})</text>

              <rect x={barX} y={y + barHeight} width={facWidth} height={barHeight} fill="#0077B0" />
              <text x={barX + facWidth + 3} y={y + barHeight * 2 + 1} fontSize="7.5" fontWeight="600" fill="#152237">{cat.facilityPercent}% ({cat.facilityCount})</text>
            </g>
          );
        })}

        <line x1={leftMargin + labelWidth} y1={topPadding - 4} x2={leftMargin + labelWidth} y2={topPadding + categories.length * rowHeight} stroke="#999" strokeWidth="1" />
      </svg>
    </div>
  );
};

const DemographicChart = ({ config, customWidth, facilityLegendLabel }) => {
  const categories = config.categories || [];
  if (categories.length > 10) {
    return <HorizontalDemographicChart config={config} customWidth={customWidth} facilityLegendLabel={facilityLegendLabel} />;
  }

  const chartHeight = 200;
  const chartWidth = customWidth || 385;
  const padding = { top: 40, right: 15, bottom: 45, left: 35 };
  const innerWidth = chartWidth - padding.left - padding.right;
  const innerHeight = chartHeight - padding.top - padding.bottom;

  const categoryWidth = categories.length > 0 ? innerWidth / categories.length : 0;
  const maxPercentage = config.maxPercentage || 100;

  return (
    <div className="bg-white" style={{ borderRadius: '4px', border: '1px solid #E1EAEB' }}>
      <svg width={chartWidth} height={chartHeight} style={{ fontFamily: 'Work Sans, sans-serif' }}>
        <text x={padding.left} y={25} textAnchor="start" fontSize="12" fontWeight="600" fill="#333">
          {config.title}
        </text>
        
        {config.showSubtitle && (
          <text x={padding.left} y={38} textAnchor="start" fontSize="8" fill="#666" fontStyle="italic">
            {config.subtitleText}{config.includeFacilityInSubtitle ? ` at ${facilityLegendLabel}` : ''}
          </text>
        )}

        {[0, 20, 40, 60, 80, 100].map((val) => {
          if (val > maxPercentage) return null;
          return (
            <g key={val}>
              <line x1={padding.left} y1={padding.top + innerHeight - (val / maxPercentage) * innerHeight} x2={padding.left + innerWidth} y2={padding.top + innerHeight - (val / maxPercentage) * innerHeight} stroke="#E5E5E5" strokeWidth="1" />
              <text x={padding.left - 8} y={padding.top + innerHeight - (val / maxPercentage) * innerHeight + 3} textAnchor="end" fontSize="9" fill="#666">{val}%</text>
            </g>
          );
        })}

        {categories.map((cat, idx) => {
          const x = padding.left + idx * categoryWidth;
          const barWidth = categoryWidth * 0.45;
          const gapBetweenCategories = categoryWidth * 0.1;
          const systemwideHeight = (cat.systemwidePercent / maxPercentage) * innerHeight;
          const facilityHeight = (cat.facilityPercent / maxPercentage) * innerHeight;

          return (
            <g key={idx}>
              <rect x={x + gapBetweenCategories / 2} y={padding.top + innerHeight - systemwideHeight} width={barWidth} height={systemwideHeight} fill="#B8D4E0" stroke="#46676F" strokeWidth="0.5" />
              <text x={x + gapBetweenCategories / 2 + barWidth / 2} y={padding.top + innerHeight - systemwideHeight - 15} textAnchor="middle" fontSize="9" fontWeight="600" fill="#4C5E61">{cat.systemwidePercent}%</text>
              <text x={x + gapBetweenCategories / 2 + barWidth / 2} y={padding.top + innerHeight - systemwideHeight - 3} textAnchor="middle" fontSize="7" fontWeight="600" fill="#666">{cat.systemwideCount}</text>

              <rect x={x + gapBetweenCategories / 2 + barWidth} y={padding.top + innerHeight - facilityHeight} width={barWidth} height={facilityHeight} fill="#0077B0" stroke="none" />
              <text x={x + gapBetweenCategories / 2 + barWidth + barWidth / 2} y={padding.top + innerHeight - facilityHeight - 15} textAnchor="middle" fontSize="9" fontWeight="600" fill="#333">{cat.facilityPercent}%</text>
              <text x={x + gapBetweenCategories / 2 + barWidth + barWidth / 2} y={padding.top + innerHeight - facilityHeight - 3} textAnchor="middle" fontSize="7" fontWeight="600" fill="#152237">{cat.facilityCount}</text>

              <text x={x + categoryWidth / 2} y={padding.top + innerHeight + 15} textAnchor="middle" fontSize="8" fontWeight="600" fill="#333">
                {(() => {
                  const words = cat.label.split(' ');
                  const lines = [];
                  let currentLine = [];
                  const maxWidth = categoryWidth * 0.9;
                  const charWidth = 4.5;
                  
                  words.forEach(word => {
                    const testLine = [...currentLine, word].join(' ');
                    if (testLine.length * charWidth < maxWidth || currentLine.length === 0) {
                      currentLine.push(word);
                    } else {
                      if (lines.length < 2) {
                        lines.push(currentLine.join(' '));
                        currentLine = [word];
                      } else {
                        currentLine.push(word);
                      }
                    }
                  });
                  if (currentLine.length > 0) {
                    lines.push(currentLine.join(' '));
                  }
                  
                  return lines.map((line, i) => (
                    <tspan key={i} x={x + categoryWidth / 2} dy={i === 0 ? 0 : 10}>{line}</tspan>
                  ));
                })()}
              </text>
            </g>
          );
        })}

        <line x1={padding.left} y1={padding.top + innerHeight} x2={padding.left + innerWidth} y2={padding.top + innerHeight} stroke="#666" strokeWidth="1" />
        <line x1={padding.left} y1={padding.top} x2={padding.left} y2={padding.top + innerHeight} stroke="#666" strokeWidth="1" />
      </svg>
    </div>
  );
};

const Dashboard = () => {
  const [activeVersion, setActiveVersion] = useState('v1');
  const [showConfig, setShowConfig] = useState(false);
  const [selectedChart, setSelectedChart] = useState(0);
  
  const [config, setConfig] = useState({
    v1: {
      facilityName: "Otisville Correctional Facility",
      date: "December 1, 2024",
      systemwideTotal: 33234,
      facilityTotal: 588,
      systemwideLegendLabel: "Systemwide Population",
      facilityLegendLabel: "Otisville Population",
      charts: [
        {
          title: "Distribution by Race",
          maxPercentage: 100,
          categories: [
            { label: "Black", systemwidePercent: 55, systemwideCount: 18306, facilityPercent: 63, facilityCount: 387 },
            { label: "White", systemwidePercent: 28, systemwideCount: 9444, facilityPercent: 20, facilityCount: 117 },
            { label: "Other", systemwidePercent: 15, systemwideCount: 4346, facilityPercent: 15, facilityCount: 68 },
            { label: "Native American", systemwidePercent: 1, systemwideCount: 119, facilityPercent: 2, facilityCount: 9 },
            { label: "Missing", systemwidePercent: 1, systemwideCount: 137, facilityPercent: 1, facilityCount: 3 },
            { label: "Asian/Pacific Islander", systemwidePercent: 1, systemwideCount: 282, facilityPercent: 1, facilityCount: 3 },
            { label: "Unknown", systemwidePercent: 0, systemwideCount: 30, facilityPercent: 0, facilityCount: 1 }
          ]
        },
        {
          title: "Distribution by Ethnicity",
          maxPercentage: 100,
          categories: [
            { label: "Not Hispanic", systemwidePercent: 77, systemwideCount: 25436, facilityPercent: 74, facilityCount: 433 },
            { label: "Hispanic", systemwidePercent: 23, systemwideCount: 7481, facilityPercent: 26, facilityCount: 153 },
            { label: "Missing", systemwidePercent: 1, systemwideCount: 318, facilityPercent: 0, facilityCount: 2 }
          ]
        },
        {
          title: "Distribution by Age",
          maxPercentage: 60,
          categories: [
            { label: "(B) 18-20", systemwidePercent: 1, systemwideCount: 341, facilityPercent: 0, facilityCount: 0 },
            { label: "(C) 21-29", systemwidePercent: 20, systemwideCount: 6639, facilityPercent: 10, facilityCount: 59 },
            { label: "(D) 30-39", systemwidePercent: 33, systemwideCount: 11067, facilityPercent: 34, facilityCount: 199 },
            { label: "(E) 40-49", systemwidePercent: 27, systemwideCount: 8857, facilityPercent: 23, facilityCount: 137 },
            { label: "(F) 50-59", systemwidePercent: 12, systemwideCount: 4524, facilityPercent: 17, facilityCount: 101 },
            { label: "(G) 60-69", systemwidePercent: 7, systemwideCount: 2346, facilityPercent: 13, facilityCount: 78 },
            { label: "(H) 70-79", systemwidePercent: 1, systemwideCount: 447, facilityPercent: 2, facilityCount: 12 },
            { label: "(I) 80-89", systemwidePercent: 0, systemwideCount: 93, facilityPercent: 0, facilityCount: 2 }
          ]
        },
        {
          title: "Distribution by Minimum Sentence",
          maxPercentage: 80,
          categories: [
            { label: "(A) None", systemwidePercent: 50, systemwideCount: 16717, facilityPercent: 52, facilityCount: 307 },
            { label: "(C) 1-<5 Years", systemwidePercent: 6, systemwideCount: 1848, facilityPercent: 3, facilityCount: 19 },
            { label: "(D) 2-5 Years", systemwidePercent: 12, systemwideCount: 3899, facilityPercent: 7, facilityCount: 41 },
            { label: "(E) 5-10 Years", systemwidePercent: 6, systemwideCount: 2060, facilityPercent: 7, facilityCount: 43 },
            { label: "(F) 10-20 Years", systemwidePercent: 8, systemwideCount: 2585, facilityPercent: 10, facilityCount: 59 },
            { label: "(H) More Than 20 Years", systemwidePercent: 17, systemwideCount: 5642, facilityPercent: 20, facilityCount: 119 }
          ]
        },
        {
          title: "Distribution by Maximum Sentence",
          maxPercentage: 80,
          categories: [
            { label: "(B) 2-3 Years", systemwidePercent: 16, systemwideCount: 5420, facilityPercent: 11, facilityCount: 62 },
            { label: "(C) 4-5 Years", systemwidePercent: 17, systemwideCount: 5571, facilityPercent: 12, facilityCount: 73 },
            { label: "(D) 6-8 Years", systemwidePercent: 10, systemwideCount: 3287, facilityPercent: 9, facilityCount: 55 },
            { label: "(E) 9-10 Years", systemwidePercent: 9, systemwideCount: 2819, facilityPercent: 11, facilityCount: 62 },
            { label: "(F) 11-20 Years", systemwidePercent: 17, systemwideCount: 5741, facilityPercent: 24, facilityCount: 141 },
            { label: "(G) More Than 20 Years", systemwidePercent: 9, systemwideCount: 2983, facilityPercent: 6, facilityCount: 36 },
            { label: "(H) Indefinite", systemwidePercent: 20, systemwideCount: 6563, facilityPercent: 23, facilityCount: 138 }
          ]
        },
        {
          title: "Distribution by Most Serious Prior Offense",
          maxPercentage: 80,
          categories: [
            { label: "Felony", systemwidePercent: 58, systemwideCount: 19243, facilityPercent: 63, facilityCount: 371 },
            { label: "Missing/None", systemwidePercent: 29, systemwideCount: 9704, facilityPercent: 25, facilityCount: 148 },
            { label: "Misdemeanor/Conviction", systemwidePercent: 12, systemwideCount: 4058, facilityPercent: 11, facilityCount: 67 },
            { label: "Arrest", systemwidePercent: 1, systemwideCount: 229, facilityPercent: 0, facilityCount: 2 }
          ]
        },
        {
          title: "Distribution by Crime Class",
          maxPercentage: 80,
          categories: [
            { label: "(A) A1 Felony", systemwidePercent: 15, systemwideCount: 4987, facilityPercent: 18, facilityCount: 106 },
            { label: "(B) A2 Felony", systemwidePercent: 3, systemwideCount: 840, facilityPercent: 2, facilityCount: 9 },
            { label: "(D) B Felony", systemwidePercent: 32, systemwideCount: 10671, facilityPercent: 40, facilityCount: 234 },
            { label: "(E) C Felony", systemwidePercent: 20, systemwideCount: 6662, facilityPercent: 21, facilityCount: 125 },
            { label: "(F) D Felony", systemwidePercent: 22, systemwideCount: 7376, facilityPercent: 17, facilityCount: 101 },
            { label: "(G) E Felony", systemwidePercent: 8, systemwideCount: 2642, facilityPercent: 3, facilityCount: 18 }
          ]
        },
        {
          title: "Distribution by Commitment County (Most Serious Offenses)",
          maxPercentage: 80,
          showSubtitle: true,
          subtitleText: "Includes Only Top 10 Commitment Counties Among Incarcerated People",
          includeFacilityInSubtitle: true,
          categories: [
            { label: "New York", systemwidePercent: 27, systemwideCount: 4201, facilityPercent: 26, facilityCount: 116 },
            { label: "Kings", systemwidePercent: 23, systemwideCount: 3302, facilityPercent: 15, facilityCount: 66 },
            { label: "Queens", systemwidePercent: 15, systemwideCount: 2167, facilityPercent: 10, facilityCount: 46 },
            { label: "Monroe", systemwidePercent: 10, systemwideCount: 2160, facilityPercent: 2, facilityCount: 9 },
            { label: "Bronx", systemwidePercent: 10, systemwideCount: 2160, facilityPercent: 8, facilityCount: 37 },
            { label: "Erie", systemwidePercent: 8, systemwideCount: 1785, facilityPercent: 3, facilityCount: 12 },
            { label: "Onondaga", systemwidePercent: 7, systemwideCount: 1630, facilityPercent: 2, facilityCount: 9 },
            { label: "Suffolk", systemwidePercent: 7, systemwideCount: 1498, facilityPercent: 5, facilityCount: 23 },
            { label: "Nassau", systemwidePercent: 6, systemwideCount: 1065, facilityPercent: 6, facilityCount: 28 },
            { label: "Albany", systemwidePercent: 5, systemwideCount: 1065, facilityPercent: 3, facilityCount: 14 }
          ]
        }
      ]
    },
    v2: {
      facilityName: "Sample Interview Facility",
      date: "January 15, 2025",
      systemwideTotal: 25000,
      facilityTotal: 450,
      systemwideLegendLabel: "Collins",
      facilityLegendLabel: "Incarcerated People Interviewed by CANY (valid DINS only)",
      charts: [
        {
          title: "Distribution by Race",
          maxPercentage: 100,
          categories: [
            { label: "Black", systemwidePercent: 50, systemwideCount: 12500, facilityPercent: 55, facilityCount: 248 },
            { label: "White", systemwidePercent: 30, systemwideCount: 7500, facilityPercent: 25, facilityCount: 113 },
            { label: "Other", systemwidePercent: 20, systemwideCount: 5000, facilityPercent: 20, facilityCount: 89 }
          ]
        },
        {
          title: "Distribution by Ethnicity",
          maxPercentage: 100,
          categories: [
            { label: "Not Hispanic", systemwidePercent: 70, systemwideCount: 17500, facilityPercent: 65, facilityCount: 293 },
            { label: "Hispanic", systemwidePercent: 30, systemwideCount: 7500, facilityPercent: 35, facilityCount: 157 }
          ]
        },
        {
          title: "Distribution by Unit/Building Code",
          maxPercentage: 100,
          categories: [
            { label: "Unit A", systemwidePercent: 40, systemwideCount: 10000, facilityPercent: 45, facilityCount: 203 },
            { label: "Unit B", systemwidePercent: 35, systemwideCount: 8750, facilityPercent: 30, facilityCount: 135 },
            { label: "Unit C", systemwidePercent: 25, systemwideCount: 6250, facilityPercent: 25, facilityCount: 112 }
          ]
        },
        {
          title: "Distribution by Age",
          maxPercentage: 60,
          categories: [
            { label: "(B) 18-20", systemwidePercent: 5, systemwideCount: 1250, facilityPercent: 3, facilityCount: 14 },
            { label: "(C) 21-29", systemwidePercent: 25, systemwideCount: 6250, facilityPercent: 20, facilityCount: 90 },
            { label: "(D) 30-39", systemwidePercent: 30, systemwideCount: 7500, facilityPercent: 35, facilityCount: 158 },
            { label: "(E) 40-49", systemwidePercent: 25, systemwideCount: 6250, facilityPercent: 28, facilityCount: 126 },
            { label: "(F) 50-59", systemwidePercent: 10, systemwideCount: 2500, facilityPercent: 10, facilityCount: 45 },
            { label: "(G) 60+", systemwidePercent: 5, systemwideCount: 1250, facilityPercent: 4, facilityCount: 17 }
          ]
        },
        {
          title: "Distribution by Minimum Sentence",
          maxPercentage: 80,
          categories: [
            { label: "(A) None", systemwidePercent: 50, systemwideCount: 12500, facilityPercent: 52, facilityCount: 234 },
            { label: "(C) 1-<5 Years", systemwidePercent: 6, systemwideCount: 1500, facilityPercent: 3, facilityCount: 14 },
            { label: "(D) 2-5 Years", systemwidePercent: 12, systemwideCount: 3000, facilityPercent: 7, facilityCount: 32 },
            { label: "(E) 5-10 Years", systemwidePercent: 6, systemwideCount: 1500, facilityPercent: 7, facilityCount: 32 },
            { label: "(F) 10-20 Years", systemwidePercent: 8, systemwideCount: 2000, facilityPercent: 10, facilityCount: 45 },
            { label: "(H) More Than 20 Years", systemwidePercent: 17, systemwideCount: 4250, facilityPercent: 20, facilityCount: 90 }
          ]
        },
        {
          title: "Distribution by Maximum Sentence",
          maxPercentage: 80,
          categories: [
            { label: "(B) 2-3 Years", systemwidePercent: 16, systemwideCount: 4000, facilityPercent: 11, facilityCount: 50 },
            { label: "(C) 4-5 Years", systemwidePercent: 17, systemwideCount: 4250, facilityPercent: 12, facilityCount: 54 },
            { label: "(D) 6-8 Years", systemwidePercent: 10, systemwideCount: 2500, facilityPercent: 9, facilityCount: 41 },
            { label: "(E) 9-10 Years", systemwidePercent: 9, systemwideCount: 2250, facilityPercent: 11, facilityCount: 50 },
            { label: "(F) 11-20 Years", systemwidePercent: 17, systemwideCount: 4250, facilityPercent: 24, facilityCount: 108 },
            { label: "(G) More Than 20 Years", systemwidePercent: 9, systemwideCount: 2250, facilityPercent: 6, facilityCount: 27 },
            { label: "(H) Indefinite", systemwidePercent: 20, systemwideCount: 5000, facilityPercent: 23, facilityCount: 104 }
          ]
        },
        {
          title: "Distribution by Most Serious Prior Offense",
          maxPercentage: 80,
          categories: [
            { label: "Felony", systemwidePercent: 58, systemwideCount: 14500, facilityPercent: 63, facilityCount: 284 },
            { label: "Missing/None", systemwidePercent: 29, systemwideCount: 7250, facilityPercent: 25, facilityCount: 113 },
            { label: "Misdemeanor/Conviction", systemwidePercent: 12, systemwideCount: 3000, facilityPercent: 11, facilityCount: 50 },
            { label: "Arrest", systemwidePercent: 1, systemwideCount: 250, facilityPercent: 1, facilityCount: 3 }
          ]
        },
        {
          title: "Distribution by Crime Class",
          maxPercentage: 80,
          categories: [
            { label: "(A) A1 Felony", systemwidePercent: 15, systemwideCount: 3750, facilityPercent: 18, facilityCount: 81 },
            { label: "(B) A2 Felony", systemwidePercent: 3, systemwideCount: 750, facilityPercent: 2, facilityCount: 9 },
            { label: "(D) B Felony", systemwidePercent: 32, systemwideCount: 8000, facilityPercent: 40, facilityCount: 180 },
            { label: "(E) C Felony", systemwidePercent: 20, systemwideCount: 5000, facilityPercent: 21, facilityCount: 95 },
            { label: "(F) D Felony", systemwidePercent: 22, systemwideCount: 5500, facilityPercent: 17, facilityCount: 77 },
            { label: "(G) E Felony", systemwidePercent: 8, systemwideCount: 2000, facilityPercent: 3, facilityCount: 14 }
          ]
        },
        {
          title: "Distribution by Commitment County (Most Serious Offense)",
          maxPercentage: 80,
          showSubtitle: true,
          subtitleText: "Includes Only Top 10 Commitment Counties Among Incarcerated People",
          includeFacilityInSubtitle: true,
          categories: [
            { label: "New York", systemwidePercent: 27, systemwideCount: 6750, facilityPercent: 26, facilityCount: 117 },
            { label: "Kings", systemwidePercent: 23, systemwideCount: 5750, facilityPercent: 15, facilityCount: 68 },
            { label: "Queens", systemwidePercent: 15, systemwideCount: 3750, facilityPercent: 10, facilityCount: 45 },
            { label: "Monroe", systemwidePercent: 10, systemwideCount: 2500, facilityPercent: 2, facilityCount: 9 },
            { label: "Bronx", systemwidePercent: 10, systemwideCount: 2500, facilityPercent: 8, facilityCount: 36 },
            { label: "Erie", systemwidePercent: 8, systemwideCount: 2000, facilityPercent: 3, facilityCount: 14 },
            { label: "Onondaga", systemwidePercent: 7, systemwideCount: 1750, facilityPercent: 2, facilityCount: 9 },
            { label: "Suffolk", systemwidePercent: 7, systemwideCount: 1750, facilityPercent: 5, facilityCount: 23 },
            { label: "Nassau", systemwidePercent: 6, systemwideCount: 1500, facilityPercent: 6, facilityCount: 27 },
            { label: "Albany", systemwidePercent: 5, systemwideCount: 1250, facilityPercent: 3, facilityCount: 14 }
          ]
        }
      ]
    },
    v3: {
      facilityName: "Collins Correctional Facility",
      date: "2016-2024",
      charts: [
        {
          title: "Facility Population Over Time",
          lines: [{ label: "Total Population", color: "#0077B0", showLegend: false, showDataLabels: true, dataPoints: [
            { year: "2015", value: 880 }, { year: "2016", value: 850 }, { year: "2017", value: 820 }, { year: "2018", value: 780 },
            { year: "2019", value: 750 }, { year: "2020", value: 650 }, { year: "2021", value: 600 },
            { year: "2022", value: 580 }, { year: "2023", value: 550 }, { year: "2024", value: 520 }
          ]}]
        },
        {
          title: "Facility Population Over Time by Unit",
          lines: [
            { label: "GP", color: "#0077B0", dataPoints: [
              { year: "2015", value: 370 }, { year: "2016", value: 350 }, { year: "2017", value: 340 }, { year: "2018", value: 320 },
              { year: "2019", value: 310 }, { year: "2020", value: 270 }, { year: "2021", value: 250 },
              { year: "2022", value: 240 }, { year: "2023", value: 230 }, { year: "2024", value: 220 }
            ]},
            { label: "RRU", color: "#E36C2E", dataPoints: [
              { year: "2015", value: 210 }, { year: "2016", value: 200 }, { year: "2017", value: 195 }, { year: "2018", value: 190 },
              { year: "2019", value: 185 }, { year: "2020", value: 160 }, { year: "2021", value: 150 },
              { year: "2022", value: 145 }, { year: "2023", value: 140 }, { year: "2024", value: 135 }
            ]},
            { label: "SHU", color: "#4CAF50", dataPoints: [
              { year: "2015", value: 160 }, { year: "2016", value: 150 }, { year: "2017", value: 145 }, { year: "2018", value: 140 },
              { year: "2019", value: 135 }, { year: "2020", value: 115 }, { year: "2021", value: 105 },
              { year: "2022", value: 100 }, { year: "2023", value: 95 }, { year: "2024", value: 90 }
            ]},
            { label: "SOP", color: "#9C27B0", dataPoints: [
              { year: "2015", value: 110 }, { year: "2016", value: 100 }, { year: "2017", value: 95 }, { year: "2018", value: 90 },
              { year: "2019", value: 85 }, { year: "2020", value: 75 }, { year: "2021", value: 65 },
              { year: "2022", value: 65 }, { year: "2023", value: 60 }, { year: "2024", value: 55 }
            ]},
            { label: "WR", color: "#FF9800", dataPoints: [
              { year: "2015", value: 60 }, { year: "2016", value: 50 }, { year: "2017", value: 45 }, { year: "2018", value: 40 },
              { year: "2019", value: 35 }, { year: "2020", value: 30 }, { year: "2021", value: 30 },
              { year: "2022", value: 30 }, { year: "2023", value: 25 }, { year: "2024", value: 20 }
            ]}
          ]
        },
        {
          title: "Facility Population Over Time by Race",
          lines: [
            { label: "Black", color: "#0077B0", dataPoints: [
              { year: "2015", value: 540 }, { year: "2016", value: 520 }, { year: "2017", value: 500 }, { year: "2018", value: 480 },
              { year: "2019", value: 460 }, { year: "2020", value: 400 }, { year: "2021", value: 370 },
              { year: "2022", value: 360 }, { year: "2023", value: 340 }, { year: "2024", value: 320 }
            ]},
            { label: "White", color: "#E36C2E", dataPoints: [
              { year: "2015", value: 240 }, { year: "2016", value: 230 }, { year: "2017", value: 220 }, { year: "2018", value: 210 },
              { year: "2019", value: 200 }, { year: "2020", value: 170 }, { year: "2021", value: 160 },
              { year: "2022", value: 150 }, { year: "2023", value: 145 }, { year: "2024", value: 140 }
            ]},
            { label: "Other", color: "#4CAF50", dataPoints: [
              { year: "2015", value: 85 }, { year: "2016", value: 80 }, { year: "2017", value: 80 }, { year: "2018", value: 75 },
              { year: "2019", value: 75 }, { year: "2020", value: 65 }, { year: "2021", value: 55 },
              { year: "2022", value: 55 }, { year: "2023", value: 50 }, { year: "2024", value: 45 }
            ]},
            { label: "Native American", color: "#9C27B0", dataPoints: [
              { year: "2015", value: 10 }, { year: "2016", value: 10 }, { year: "2017", value: 10 }, { year: "2018", value: 8 },
              { year: "2019", value: 8 }, { year: "2020", value: 8 }, { year: "2021", value: 8 },
              { year: "2022", value: 8 }, { year: "2023", value: 8 }, { year: "2024", value: 8 }
            ]},
            { label: "Asian/Pacific Islander", color: "#FF9800", dataPoints: [
              { year: "2015", value: 8 }, { year: "2016", value: 8 }, { year: "2017", value: 8 }, { year: "2018", value: 6 },
              { year: "2019", value: 6 }, { year: "2020", value: 6 }, { year: "2021", value: 6 },
              { year: "2022", value: 6 }, { year: "2023", value: 6 }, { year: "2024", value: 6 }
            ]},
            { label: "Missing", color: "#00BCD4", dataPoints: [
              { year: "2015", value: 2 }, { year: "2016", value: 2 }, { year: "2017", value: 2 }, { year: "2018", value: 1 },
              { year: "2019", value: 1 }, { year: "2020", value: 1 }, { year: "2021", value: 1 },
              { year: "2022", value: 1 }, { year: "2023", value: 1 }, { year: "2024", value: 1 }
            ]},
            { label: "Unknown", color: "#F44336", dataPoints: [
              { year: "2015", value: 0 }, { year: "2016", value: 0 }, { year: "2017", value: 0 }, { year: "2018", value: 0 },
              { year: "2019", value: 0 }, { year: "2020", value: 0 }, { year: "2021", value: 0 },
              { year: "2022", value: 0 }, { year: "2023", value: 0 }, { year: "2024", value: 0 }
            ]}
          ]
        },
        {
          title: "Facility Population Over Time by Age",
          lines: [
            { label: "(B) 18-20", color: "#0077B0", dataPoints: [
              { year: "2015", value: 22 }, { year: "2016", value: 20 }, { year: "2017", value: 18 }, { year: "2018", value: 15 },
              { year: "2019", value: 12 }, { year: "2020", value: 10 }, { year: "2021", value: 8 },
              { year: "2022", value: 7 }, { year: "2023", value: 5 }, { year: "2024", value: 3 }
            ]},
            { label: "(C) 21-29", color: "#E36C2E", dataPoints: [
              { year: "2015", value: 190 }, { year: "2016", value: 180 }, { year: "2017", value: 170 }, { year: "2018", value: 160 },
              { year: "2019", value: 150 }, { year: "2020", value: 130 }, { year: "2021", value: 120 },
              { year: "2022", value: 115 }, { year: "2023", value: 110 }, { year: "2024", value: 105 }
            ]},
            { label: "(D) 30-39", color: "#4CAF50", dataPoints: [
              { year: "2015", value: 290 }, { year: "2016", value: 280 }, { year: "2017", value: 270 }, { year: "2018", value: 260 },
              { year: "2019", value: 250 }, { year: "2020", value: 220 }, { year: "2021", value: 200 },
              { year: "2022", value: 195 }, { year: "2023", value: 185 }, { year: "2024", value: 175 }
            ]},
            { label: "(E) 40-49", color: "#9C27B0", dataPoints: [
              { year: "2015", value: 240 }, { year: "2016", value: 230 }, { year: "2017", value: 220 }, { year: "2018", value: 210 },
              { year: "2019", value: 200 }, { year: "2020", value: 180 }, { year: "2021", value: 165 },
              { year: "2022", value: 160 }, { year: "2023", value: 150 }, { year: "2024", value: 145 }
            ]},
            { label: "(F) 50-59", color: "#FF9800", dataPoints: [
              { year: "2015", value: 115 }, { year: "2016", value: 110 }, { year: "2017", value: 110 }, { year: "2018", value: 105 },
              { year: "2019", value: 100 }, { year: "2020", value: 85 }, { year: "2021", value: 80 },
              { year: "2022", value: 75 }, { year: "2023", value: 72 }, { year: "2024", value: 68 }
            ]},
            { label: "(G) 60-69", color: "#00BCD4", dataPoints: [
              { year: "2015", value: 38 }, { year: "2016", value: 40 }, { year: "2017", value: 42 }, { year: "2018", value: 40 },
              { year: "2019", value: 45 }, { year: "2020", value: 30 }, { year: "2021", value: 30 },
              { year: "2022", value: 30 }, { year: "2023", value: 28 }, { year: "2024", value: 22 }
            ]},
            { label: "(H) 70-79", color: "#F44336", dataPoints: [
              { year: "2015", value: 10 }, { year: "2016", value: 8 }, { year: "2017", value: 8 }, { year: "2018", value: 4 },
              { year: "2019", value: 4 }, { year: "2020", value: 4 }, { year: "2021", value: 4 },
              { year: "2022", value: 4 }, { year: "2023", value: 4 }, { year: "2024", value: 3 }
            ]},
            { label: "(I) 80-89", color: "#795548", dataPoints: [
              { year: "2015", value: 3 }, { year: "2016", value: 2 }, { year: "2017", value: 2 }, { year: "2018", value: 1 },
              { year: "2019", value: 1 }, { year: "2020", value: 1 }, { year: "2021", value: 1 },
              { year: "2022", value: 1 }, { year: "2023", value: 1 }, { year: "2024", value: 0 }
            ]}
          ]
        }
      ]
    }
  });

  const currentData = config[activeVersion];

  const updateChart = (chartIndex, newData) => {
    const newCharts = [...currentData.charts];
    newCharts[chartIndex] = newData;
    setConfig({
      ...config,
      [activeVersion]: { ...currentData, charts: newCharts }
    });
  };

  const updateVersionData = (field, value) => {
    setConfig({
      ...config,
      [activeVersion]: { ...currentData, [field]: value }
    });
  };

  return (
    <div className="w-full mx-auto p-4 bg-gray-50" style={{ fontFamily: 'Work Sans, sans-serif' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Work+Sans:wght@400;600;700&display=swap');
        @media print {
          .no-print { display: none !important; }
        }
      `}</style>

      <div className="no-print mb-4 space-y-2">
        <div className="bg-white p-4 rounded-lg border mb-4">
          <label className="block text-sm font-semibold mb-2">Dashboard Version</label>
          <div className="flex gap-2">
            <button onClick={() => setActiveVersion('v1')} className={`px-6 py-2 rounded font-medium transition-colors ${activeVersion === 'v1' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}>Version 1 (Population)</button>
            <button onClick={() => setActiveVersion('v2')} className={`px-6 py-2 rounded font-medium transition-colors ${activeVersion === 'v2' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}>Version 2 (Interview Sample)</button>
            <button onClick={() => setActiveVersion('v3')} className={`px-6 py-2 rounded font-medium transition-colors ${activeVersion === 'v3' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}>Version 3 (Line Graphs)</button>
          </div>
        </div>

        <div className="flex gap-2 flex-wrap">
          <button onClick={() => setShowConfig(!showConfig)} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm">
            {showConfig ? 'Hide' : 'Show'} Configuration
          </button>
          <button onClick={() => window.print()} className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 text-sm">
            Print Dashboard
          </button>
          <button onClick={() => {
            const dataStr = JSON.stringify(config, null, 2);
            const dataBlob = new Blob([dataStr], { type: 'application/json' });
            const url = URL.createObjectURL(dataBlob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `dashboard-config-${Date.now()}.json`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
          }} className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 text-sm">
            Export Config
          </button>
          <label className="px-4 py-2 bg-orange-600 text-white rounded hover:bg-orange-700 cursor-pointer text-sm">
            Import Config
            <input type="file" accept=".json" className="hidden" onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) {
                const reader = new FileReader();
                reader.onload = (event) => {
                  try {
                    const imported = JSON.parse(event.target.result);
                    setConfig(imported);
                  } catch (err) {
                    alert('Invalid JSON file');
                  }
                };
                reader.readAsText(file);
              }
            }} />
          </label>
        </div>
      </div>

      {showConfig && activeVersion !== 'v3' && (
        <div className="no-print bg-white p-6 rounded-lg border mb-4 space-y-4">
          <h3 className="font-semibold text-lg mb-4">
            {activeVersion === 'v1' ? 'Version 1' : 'Version 2'} Configuration
          </h3>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Facility Name</label>
              <input type="text" value={currentData.facilityName} onChange={(e) => updateVersionData('facilityName', e.target.value)} className="w-full px-3 py-2 border rounded" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Date</label>
              <input type="text" value={currentData.date} onChange={(e) => updateVersionData('date', e.target.value)} className="w-full px-3 py-2 border rounded" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">{activeVersion === 'v2' ? 'Facility' : 'Systemwide Total'}</label>
              <input type="number" value={currentData.systemwideTotal} onChange={(e) => updateVersionData('systemwideTotal', parseInt(e.target.value))} className="w-full px-3 py-2 border rounded" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">{activeVersion === 'v2' ? 'Interview Sample' : 'Facility Total'}</label>
              <input type="number" value={currentData.facilityTotal} onChange={(e) => updateVersionData('facilityTotal', parseInt(e.target.value))} className="w-full px-3 py-2 border rounded" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">{activeVersion === 'v2' ? 'Facility' : 'Systemwide Legend Label'}</label>
              <input type="text" value={currentData.systemwideLegendLabel} onChange={(e) => updateVersionData('systemwideLegendLabel', e.target.value)} className="w-full px-3 py-2 border rounded" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Facility Legend Label</label>
              <input type="text" value={currentData.facilityLegendLabel} onChange={(e) => updateVersionData('facilityLegendLabel', e.target.value)} className="w-full px-3 py-2 border rounded" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Select Chart to Edit</label>
            <select value={selectedChart} onChange={(e) => setSelectedChart(parseInt(e.target.value))} className="w-full px-3 py-2 border rounded mb-4">
              {currentData.charts.map((chart, idx) => (
                <option key={idx} value={idx}>{chart.title}</option>
              ))}
            </select>

            <div className="flex gap-2 mb-2 flex-wrap">
              <label className="px-4 py-2 bg-orange-600 text-white rounded hover:bg-orange-700 cursor-pointer text-sm">
                Import CSV for this Chart
                <input type="file" accept=".csv" className="hidden" onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    const reader = new FileReader();
                    reader.onload = (event) => {
                      try {
                        const csv = event.target.result;
                        const lines = csv.split('\n').filter(line => line.trim());
                        const dataLines = lines.slice(1);
                        const categories = dataLines.map(line => {
                          const parts = line.split(',').map(p => p.trim());
                          return {
                            label: parts[0],
                            systemwidePercent: parseFloat(parts[1]) || 0,
                            systemwideCount: parseInt(parts[2]) || 0,
                            facilityPercent: parseFloat(parts[3]) || 0,
                            facilityCount: parseInt(parts[4]) || 0
                          };
                        });
                        const updatedChart = { ...currentData.charts[selectedChart], categories: categories };
                        updateChart(selectedChart, updatedChart);
                        alert('CSV imported successfully!');
                      } catch (err) {
                        alert('Error parsing CSV: ' + err.message);
                      }
                    };
                    reader.readAsText(file);
                  }
                }} />
              </label>

              <button onClick={() => {
                const chart = currentData.charts[selectedChart];
                const csvContent = [
                  'label,systemwidePercent,systemwideCount,facilityPercent,facilityCount',
                  ...chart.categories.map(cat => `${cat.label},${cat.systemwidePercent},${cat.systemwideCount},${cat.facilityPercent},${cat.facilityCount}`)
                ].join('\n');
                const blob = new Blob([csvContent], { type: 'text/csv' });
                const url = URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;
                link.download = `${chart.title.replace(/[^a-z0-9]/gi, '_')}_${Date.now()}.csv`;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                URL.revokeObjectURL(url);
              }} className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 text-sm">
                Export CSV for this Chart
              </button>

              <label className="px-4 py-2 bg-teal-600 text-white rounded hover:bg-teal-700 cursor-pointer text-sm">
                Import JSON for this Chart
                <input type="file" accept=".json" className="hidden" onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    const reader = new FileReader();
                    reader.onload = (event) => {
                      try {
                        const parsed = JSON.parse(event.target.result);
                        updateChart(selectedChart, parsed);
                        alert('JSON imported successfully!');
                      } catch (err) {
                        alert('Invalid JSON file');
                      }
                    };
                    reader.readAsText(file);
                  }
                }} />
              </label>

              <button onClick={() => {
                const chart = currentData.charts[selectedChart];
                const blob = new Blob([JSON.stringify(chart, null, 2)], { type: 'application/json' });
                const url = URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;
                link.download = `${chart.title.replace(/[^a-z0-9]/gi, '_')}_${Date.now()}.json`;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                URL.revokeObjectURL(url);
              }} className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 text-sm">
                Export JSON for this Chart
              </button>
            </div>

            <div className="mb-4 p-3 bg-blue-50 rounded border border-blue-200">
              <p className="text-xs text-blue-900 font-semibold mb-1">CSV Format:</p>
              <p className="text-xs text-blue-800 font-mono">label,systemwidePercent,systemwideCount,facilityPercent,facilityCount</p>
              <p className="text-xs text-blue-700 mt-2">Example: Black,55,18306,63,387</p>
            </div>

            {currentData.charts[selectedChart]?.showSubtitle && (
              <div className="mb-4 p-3 bg-gray-50 rounded border">
                <label className="flex items-center gap-2 text-sm">
                  <input type="checkbox" checked={currentData.charts[selectedChart].includeFacilityInSubtitle || false} onChange={(e) => {
                    const newCharts = [...currentData.charts];
                    newCharts[selectedChart] = { ...newCharts[selectedChart], includeFacilityInSubtitle: e.target.checked };
                    setConfig({...config, [activeVersion]: {...currentData, charts: newCharts}});
                  }} className="w-4 h-4" />
                  <span className="font-medium">Include facility name in subtitle</span>
                </label>
                <p className="text-xs text-gray-600 mt-1 ml-6">
                  When enabled, adds "at {activeVersion === 'v2' ? currentData.systemwideLegendLabel : currentData.facilityLegendLabel.replace(' Population', '')}" to the subtitle
                </p>
              </div>
            )}

            <label className="block text-sm font-medium mb-2">Chart Data (JSON)</label>
            <textarea value={JSON.stringify(currentData.charts[selectedChart], null, 2)} onChange={(e) => {
              try {
                const parsed = JSON.parse(e.target.value);
                updateChart(selectedChart, parsed);
              } catch (err) {}
            }} className="w-full px-3 py-2 border rounded font-mono text-xs" rows={15} />
          </div>
        </div>
      )}

      {showConfig && activeVersion === 'v3' && (
        <div className="no-print bg-white p-6 rounded-lg border mb-4 space-y-4">
          <h3 className="font-semibold text-lg mb-4">Version 3 Configuration</h3>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Facility Name</label>
              <input type="text" value={currentData.facilityName} onChange={(e) => updateVersionData('facilityName', e.target.value)} className="w-full px-3 py-2 border rounded" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Date Range</label>
              <input type="text" value={currentData.date} onChange={(e) => updateVersionData('date', e.target.value)} className="w-full px-3 py-2 border rounded" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Select Chart to Edit</label>
            <select value={selectedChart} onChange={(e) => setSelectedChart(parseInt(e.target.value))} className="w-full px-3 py-2 border rounded mb-4">
              {currentData.charts.map((chart, idx) => (
                <option key={idx} value={idx}>{chart.title}</option>
              ))}
            </select>

            <div className="flex gap-2 mb-4 flex-wrap">
              <label className="px-4 py-2 bg-teal-600 text-white rounded hover:bg-teal-700 cursor-pointer text-sm">
                Import JSON for this Chart
                <input type="file" accept=".json" className="hidden" onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    const reader = new FileReader();
                    reader.onload = (event) => {
                      try {
                        const parsed = JSON.parse(event.target.result);
                        updateChart(selectedChart, parsed);
                        alert('JSON imported successfully!');
                      } catch (err) {
                        alert('Invalid JSON file');
                      }
                    };
                    reader.readAsText(file);
                  }
                }} />
              </label>

              <button onClick={() => {
                const chart = currentData.charts[selectedChart];
                const blob = new Blob([JSON.stringify(chart, null, 2)], { type: 'application/json' });
                const url = URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;
                link.download = `${chart.title.replace(/[^a-z0-9]/gi, '_')}_${Date.now()}.json`;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                URL.revokeObjectURL(url);
              }} className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 text-sm">
                Export JSON for this Chart
              </button>
            </div>

            <label className="block text-sm font-medium mb-2">Chart Data (JSON)</label>
            <textarea value={JSON.stringify(currentData.charts[selectedChart], null, 2)} onChange={(e) => {
              try {
                const parsed = JSON.parse(e.target.value);
                updateChart(selectedChart, parsed);
              } catch (err) {}
            }} className="w-full px-3 py-2 border rounded font-mono text-xs" rows={15} />
          </div>
        </div>
      )}

      <div className="bg-white p-6 rounded-lg shadow-lg max-w-[8.5in] mx-auto" style={{ width: '8.5in' }}>
        {activeVersion === 'v3' ? (
          <>
            <div className="pb-3 mb-4" style={{ borderRadius: '4px', background: '#F5F7F7', padding: '12px 16px', border: '1px solid #E1EAEB' }}>
              <h1 style={{ fontSize: '12px', fontWeight: '600' }}>
                Population Demographics as of {currentData.date} | {currentData.facilityName}
              </h1>
            </div>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <LineChart 
                  config={currentData.charts[0]} 
                  customWidth={385} 
                  customPadding={{ top: 40, right: 30, bottom: 45, left: 50 }}
                />
                <LineChart 
                  config={currentData.charts[1]} 
                  customWidth={385} 
                  customPadding={{ top: 40, right: 100, bottom: 45, left: 50 }}
                />
              </div>
              <div>
                <LineChart config={currentData.charts[2]} customWidth={790} />
              </div>
              <div>
                <LineChart config={currentData.charts[3]} customWidth={790} />
              </div>
            </div>
          </>
        ) : (
          <>
            <div className="pb-3 mb-4" style={{ borderRadius: '4px', background: '#F5F7F7', padding: '12px 16px', border: '1px solid #E1EAEB' }}>
              <div className="flex justify-between items-start">
                <div>
                  <h1 className="mb-2" style={{ fontSize: '12px', fontWeight: '600' }}>
                    Population Demographics as of {currentData.date} | {currentData.facilityName}
                  </h1>
                  <div className="flex gap-6" style={{ fontSize: '12px' }}>
                    <div className="flex items-center gap-2">
                      <div style={{ width: '16px', height: '16px', background: '#B8D4E0', borderRadius: '2px', border: '1px solid #666' }}></div>
                      <span className="font-semibold">{currentData.systemwideLegendLabel}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div style={{ width: '16px', height: '16px', background: '#0077B0', borderRadius: '2px', border: '1px solid #666' }}></div>
                      <span className="font-semibold">{currentData.facilityLegendLabel}</span>
                    </div>
                  </div>
                </div>
                <div className="flex gap-4" style={{ fontSize: '12px' }}>
                  <div className="text-right">
                    <div className="font-semibold text-gray-600">{currentData.systemwideLegendLabel}</div>
                    <div style={{ fontWeight: '600' }}>{currentData.systemwideTotal.toLocaleString()}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold text-gray-600">{activeVersion === 'v2' ? 'Interview Sample' : currentData.facilityLegendLabel.replace(' Population', '')}</div>
                    <div style={{ fontWeight: '600' }}>{currentData.facilityTotal.toLocaleString()}</div>
                  </div>
                </div>
              </div>
            </div>

            {activeVersion === 'v1' ? (
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  {currentData.charts.slice(0, 6).map((chart, idx) => (
                    <DemographicChart key={idx} config={chart} facilityLegendLabel={currentData.facilityLegendLabel} />
                  ))}
                </div>
                {(currentData.charts[7]?.categories?.length ?? 0) > 10 ? (
                  <>
                    <div className="grid grid-cols-2 gap-3">
                      <DemographicChart config={currentData.charts[6]} facilityLegendLabel={currentData.facilityLegendLabel} />
                    </div>
                    <div>
                      <DemographicChart config={currentData.charts[7]} customWidth={770} facilityLegendLabel={currentData.facilityLegendLabel} />
                    </div>
                  </>
                ) : (
                  <div className="flex gap-3">
                    <div style={{ width: '40%' }}>
                      <DemographicChart config={currentData.charts[6]} customWidth={305} facilityLegendLabel={currentData.facilityLegendLabel} />
                    </div>
                    <div style={{ width: '60%' }}>
                      <DemographicChart config={currentData.charts[7]} customWidth={465} facilityLegendLabel={currentData.facilityLegendLabel} />
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-3">
                <div className="grid grid-cols-3 gap-3">
                  {currentData.charts.slice(0, 3).map((chart, idx) => (
                    <DemographicChart key={idx} config={chart} customWidth={250} facilityLegendLabel={currentData.facilityLegendLabel} />
                  ))}
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {currentData.charts.slice(3, 5).map((chart, idx) => (
                    <DemographicChart key={idx + 3} config={chart} facilityLegendLabel={currentData.facilityLegendLabel} />
                  ))}
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {currentData.charts.slice(5, 7).map((chart, idx) => (
                    <DemographicChart key={idx + 5} config={chart} facilityLegendLabel={currentData.facilityLegendLabel} />
                  ))}
                </div>
                {(currentData.charts[8]?.categories?.length ?? 0) > 10 ? (
                  <>
                    <div className="grid grid-cols-2 gap-3">
                      <DemographicChart config={currentData.charts[7]} facilityLegendLabel={currentData.facilityLegendLabel} />
                    </div>
                    <div>
                      <DemographicChart config={currentData.charts[8]} customWidth={770} facilityLegendLabel={currentData.systemwideLegendLabel} />
                    </div>
                  </>
                ) : (
                  <div className="flex gap-3">
                    <div style={{ width: '40%' }}>
                      <DemographicChart config={currentData.charts[7]} customWidth={305} facilityLegendLabel={currentData.facilityLegendLabel} />
                    </div>
                    <div style={{ width: '60%' }}>
                      <DemographicChart config={currentData.charts[8]} customWidth={465} facilityLegendLabel={currentData.systemwideLegendLabel} />
                    </div>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Dashboard;