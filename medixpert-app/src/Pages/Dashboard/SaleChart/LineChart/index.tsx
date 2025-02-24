import React, { useEffect, useState } from "react";
import * as d3 from 'd3';
import Constant from "../../../../Global/Constant";
import { t } from "i18next";

interface RawSaleData {
    [key: string]: {
        roundedGrandTotal: number;
    };
}

interface RawCollectionData {
    [key: string]: {
        totalPaidAmount: number;
    };
}

const SaleCollectionLineChart: React.FC<{ 
    chartRef: React.RefObject<HTMLDivElement>; 
    currentData: RawSaleData; 
    currentCollectionData: RawCollectionData;
    segment?: string;
}> = ({ chartRef, currentData, currentCollectionData, segment }) => {
    const [dimensions, setDimensions] = useState({ width: 600, height: 300 });

    useEffect(() => {
        if (!chartRef.current) return;

        const resizeObserver = new ResizeObserver(entries => {
            for (let entry of entries) {
                setDimensions(prev => ({
                    width: entry.contentRect.width,
                    height: prev.height,
                }));
            }
        });

        resizeObserver.observe(chartRef.current);
        return () => resizeObserver.disconnect();
    }, [chartRef]);

    useEffect(() => {
        if (!chartRef.current) return;

        const salesData = Object.entries(currentData).map(([key, value]) => ({
            date: key,
            sales: value.roundedGrandTotal
        }));

        const collectionData = Object.entries(currentCollectionData).map(([key, value]) => ({
            date: key,
            collections: value.totalPaidAmount
        }));

        const allDates = Array.from(new Set([...salesData.map(d => d.date), ...collectionData.map(d => d.date)]));

        const formattedData = allDates.map(date => ({
            date,
            sales: salesData.find(d => d.date === date)?.sales || 0,
            collections: collectionData.find(d => d.date === date)?.collections || 0
        }));
        
        const { width, height } = dimensions;
        const margin = { top: 10, right: 10, bottom: 40, left: 50 };

        d3.select(chartRef.current).selectAll('*').remove();
        const svg = d3.select(chartRef.current)
            .append('svg')
            .attr('width', width)
            .attr('height', height);
        
        const xScale = d3.scaleBand()
            .domain(formattedData.map(d => d.date))
            .range([margin.left, width - margin.right])
            .padding(0.2);

        const xAxis = d3.axisBottom(xScale);

        svg.append('g')
            .attr('transform', `translate(0,${height - margin.bottom})`)
            .call(xAxis);

        const maxSales = d3.max(formattedData, d => Math.max(d.sales, d.collections)) || 0;
        const orderOfMagnitude = Math.pow(10, Math.floor(Math.log10(maxSales)));
        const dynamicStep = Math.ceil(maxSales / orderOfMagnitude) * orderOfMagnitude;
        let roundedMaxSales = Math.ceil(maxSales / dynamicStep) * dynamicStep;
        if (roundedMaxSales === maxSales) {
            roundedMaxSales += dynamicStep;
        }

        const yScale = d3.scaleLinear()
            .domain([0, roundedMaxSales])
            .nice()
            .range([height - margin.bottom, margin.top]);

        const yAxis = d3.axisLeft(yScale)
            .ticks(6)
            .tickSize(-width + margin.left + margin.right)
            .tickFormat((d: any) => (Constant.currencySymbol || Constant.currencyShort) + ' ' + d.toFixed(Constant.roundOffs.sale.amount));

        const lineGenerator = (key: 'sales' | 'collections') =>
                d3.line<{ date: string; value: number }>()
                    .x(d => xScale(d.date)! + xScale.bandwidth() / 2)
                    .y(d => yScale(d.value)); 

        const salesDataForLine = formattedData.map(d => ({ date: d.date, value: d.sales }));
        const collectionsDataForLine = formattedData.map(d => ({ date: d.date, value: d.collections }));

        svg.append('g')
            .attr('class', 'grid')
            .attr('transform', `translate(${margin.left},0)`)
            .call(yAxis)
            .selectAll('line')
            .attr('stroke', '#ddd')
            .attr('stroke-width', 0.7)
            .attr('stroke-dasharray', '4,4');

        svg.select('.grid .domain').remove();

        const colors = { sales: '#007bff', collections: '#28a745' };
        
        const salesPath = svg.append('path')
            .attr('class', 'line-sales')
            .datum(salesDataForLine)
            .attr('fill', 'none')
            .attr('stroke', colors.sales)
            .attr('stroke-width', 2)
            .attr('d', lineGenerator('sales'));

        const saleTotalLength = (salesPath.node() as unknown as SVGPathElement)?.getTotalLength() || 0;

        salesPath
            .attr('stroke-dasharray', saleTotalLength + ' ' + saleTotalLength)
            .attr('stroke-dashoffset', saleTotalLength)
            .transition()
            .duration(1000)
            .ease(d3.easeLinear)
            .attr('stroke-dashoffset', 0)
            .attr('opacity', 0.5);
        
        const collectionPath = svg.append('path')
            .attr('class', 'line-collections')
            .datum(collectionsDataForLine)
            .attr('fill', 'none')
            .attr('stroke', colors.collections)
            .attr('stroke-width', 2)
            .attr('d', lineGenerator('collections'));

        const collectionTotalLength = (collectionPath.node() as unknown as SVGPathElement)?.getTotalLength() || 0;

        collectionPath
            .attr('stroke-dasharray', collectionTotalLength + ' ' + collectionTotalLength)
            .attr('stroke-dashoffset', collectionTotalLength)
            .transition()
            .duration(1000)
            .ease(d3.easeLinear)
            .attr('stroke-dashoffset', 0)
            .attr('opacity', 0.5);
        
        svg.selectAll('.dot-sales')
            .data(salesDataForLine)
            .enter()
            .append('circle')
            .attr('class', 'dot-sales')
            .attr('cx', d => xScale(d.date)! + xScale.bandwidth() / 2)
            .attr('cy', d => yScale(d.value))
            .attr('r', 2)
            .attr('fill', colors.sales);
        
        svg.selectAll('.dot-collections')
            .data(collectionsDataForLine)
            .enter()
            .append('circle')
            .attr('class', 'dot-collections')
            .attr('cx', d => xScale(d.date)! + xScale.bandwidth() / 2)
            .attr('cy', d => yScale(d.value))
            .attr('r', 2)
            .attr('fill', colors.collections);

        const tooltip = d3
            .select(chartRef.current)
            .append('div')
            .style('position', 'absolute')
            .style('background', 'rgba(0, 0, 0, 0.8)')
            .style('color', '#fff')
            .style('padding', '5px 10px')
            .style('border-radius', '5px')
            .style('font-size', '10px')
            .style('pointer-events', 'none')
            .style('opacity', 0);

        const hoverLineGroup = svg.append('g').style('display', 'none');

        const hoverLine = hoverLineGroup.append('line')
            .attr('stroke', '#aaa')
            .attr('stroke-width', 1)
            .attr('stroke-dasharray', '4, 4')
            .attr('y1', margin.top)
            .attr('y2', height - margin.bottom)
            .attr('opacity', 0.5);

        svg.append('rect')
            .attr('width', width)
            .attr('height', height)
            .style('fill', 'none')
            .style('pointer-events', 'all')
            .on('mousemove', function (event) {
                const [mouseX, mouseY] = d3.pointer(event);
                const containerRect = chartRef.current?.getBoundingClientRect();
                if (!containerRect) return;
        
                const closestData = formattedData.reduce((a, b) => 
                    Math.abs(xScale(a.date)! + xScale.bandwidth() / 2 - mouseX) <
                    Math.abs(xScale(b.date)! + xScale.bandwidth() / 2 - mouseX) 
                        ? a 
                        : b
                );
        
                const xPosition = xScale(closestData.date)! + xScale.bandwidth() / 2;
        
                if (Math.abs(mouseX - xPosition) < 20) {
                    hoverLineGroup.style('display', null);
                    hoverLine.attr('x1', xPosition).attr('x2', xPosition);
        
                    const dateText = segment === 'Weekly' ? t('weekText')
                                    : segment === 'Monthly' ? t('monthText')
                                    : segment === 'Quarterly' ? t('quarterText')
                                    : segment === 'Yearly' ? t('yearText') 
                                    : t('dateText');
        
                    tooltip
                        .style('opacity', 1)
                        .html(`
                            ${dateText}: <strong>${closestData.date}</strong><br> 
                            ${t('salesText')}: <strong>${(Constant.currencySymbol || Constant.currencyShort) + ' ' + closestData.sales.toFixed(Constant.roundOffs.sale.amount)}</strong><br>
                            ${t('collectionsText')}: <strong>${(Constant.currencySymbol || Constant.currencyShort) + ' ' + closestData.collections.toFixed(Constant.roundOffs.sale.amount)}</strong>
                        `)
                        .style('left', `${event.clientX - containerRect.left + 15}px`)
                        .style('top', `${event.clientY - containerRect.top + 30}px`);
                } else {
                    hoverLineGroup.style('display', 'none');
                    tooltip.style('opacity', 0);
                }
            })
            .on('mouseout', function () {
                hoverLineGroup.style('display', 'none');
                tooltip.style('opacity', 0);
            });

        const activeLines: any = { sales: true, collections: true };

        const legendData = [
            { key: 'sales', name: t('salesText'), color: colors.sales },
            { key: 'collections', name: t('collectionsText'), color: colors.collections }
        ];

        const legend = svg.append('g')
            .attr('transform', `translate(${(width - (margin.left + margin.right)) / 2}, ${height - margin.top + 3})`);

        legend.selectAll('g')
            .data(legendData)
            .enter()
            .append('g')
            .attr('transform', (d, i) => `translate(${i * 60}, 0)`)
            .style('cursor', 'pointer')
            .each(function (d) {
                const legendItem = d3.select(this);

                legendItem.append('rect')
                    .attr('width', 7)
                    .attr('height', 7)
                    .attr('fill', d.color);

                legendItem.append('text')
                    .attr('x', 10)
                    .attr('y', 7)
                    .attr('font-size', '9px')
                    .attr('fill', '#333')
                    .text(d.name);

                legendItem.on('click', function () {
                    activeLines[d.key] = !activeLines[d.key];

                    const line = svg.selectAll(`.line-${d.key}`);
                    const dots = svg.selectAll(`.dot-${d.key}`);
                    const totalLength = (line.node() as SVGPathElement)?.getTotalLength() || 0;

                    if (activeLines[d.key]) {
                        line
                            .attr('stroke-dasharray', `${totalLength} ${totalLength}`)
                            .attr('stroke-dashoffset', totalLength)
                            .transition()
                            .duration(1000)
                            .ease(d3.easeLinear)
                            .attr('stroke-dashoffset', 0)
                            .attr('opacity', 0.5);
                
                        dots.transition().duration(500).style('opacity', 1);
                    } else {
                        line
                            .transition()
                            .duration(1000)
                            .ease(d3.easeLinear)
                            .attr('stroke-dashoffset', totalLength)
                            .on('end', () => line.attr('opacity', 0));
                
                        dots.transition().duration(500).style('opacity', 0);
                    }

                    legendItem.select('rect')
                        .attr('opacity', activeLines[d.key] ? 1 : 0.5);

                    legendItem.select('text')
                        .attr('text-decoration', activeLines[d.key] ? '' : 'line-through');
                });
            });

    }, [dimensions, chartRef, currentData, currentCollectionData, segment]);

    return <div ref={chartRef} style={{ width: '100%', height: '100%' }} />;
};

export default SaleCollectionLineChart;