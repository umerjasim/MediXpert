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

const SaleCollectionBarChart: React.FC<{ 
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

        const x0 = d3.scaleBand()
            .domain(formattedData.map(d => d.date))
            .range([margin.left, width - margin.right])
            .padding(0.2);

        const x1 = d3.scaleBand()
            .domain(['sales', 'collections'])
            .range([0, x0.bandwidth()])
            .padding(0.05);

        const xAxis = d3.axisBottom(x0);

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

        svg.append('g')
            .attr('transform', `translate(0,${height - margin.bottom})`)
            .call(xAxis);

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

        const bars = svg.append('g')
            .attr('class', 'full-bar')
            .selectAll('g')
            .data(formattedData)
            .enter()
            .append('g')
            .attr('transform', d => `translate(${x0(d.date)},0)`);

        bars.selectAll('rect')
            .data(d => [
                { key: 'sales', value: d.sales },
                { key: 'collections', value: d.collections }
            ])
            .enter()
            .append('rect')
            .attr('class', d => `bar-${d.key} bar`)
            .attr('x', d => x1(d.key)!)
            .attr('y', height - margin.bottom)
            .attr('width', x1.bandwidth())
            .attr('fill', (d: any) => colors[d.key as 'sales' | 'collections'])
            .attr('opacity', 0.2)
            .transition()
            .duration(1000)
            .ease(d3.easeCubicOut)
            .attr('y', d => yScale(d.value))
            .attr('height', d => height - margin.bottom - yScale(d.value));

            bars.selectAll('.bar-label')
            .data(d => [
                { key: 'sales', value: d.sales },
                { key: 'collections', value: d.collections }
            ])
            .enter()
            .append('text')
            .attr('class', d => `bar-label-${d.key} bar-label`)
            .attr('x', d => x1(d.key)! + x1.bandwidth() / 2)
            .attr('y', height - margin.bottom - 5)
            .attr('text-anchor', 'middle')
            .attr('font-size', '7px')
            .text(d => (Constant.currencySymbol || Constant.currencyShort) + ' ' + d.value.toFixed(Constant.roundOffs.sale.amount))
            .attr('fill', d => colors[d.key as 'sales' | 'collections'])
            .style('opacity', 0)
            .transition()
            .duration(1000)
            .ease(d3.easeCubicOut)
            .attr('y', d => yScale(d.value) - 5)
            .style('opacity', 1);
        

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

        svg
            .selectAll('.bar')
            .data(formattedData.flatMap(d => [
                { date: d.date, key: 'sales', value: d.sales },
                { date: d.date, key: 'collections', value: d.collections }
            ]))
            .on('mouseover', function (event, d: any) {
                const containerRect = chartRef.current?.getBoundingClientRect();
                if (!containerRect) return;

                const dateText = segment === 'Weekly' ? t('weekText')
                                : segment === 'Monthly' ? t('monthText')
                                : segment === 'Quarterly' ? t('quarterText')
                                : segment === 'Yearly' ? t('yearText') 
                                : t('dateText');

                tooltip
                    .style('opacity', 1)
                    .html(`
                        ${dateText}: <strong>${d.date}</strong> <br> 
                        ${t(d.key+'Text').charAt(0).toUpperCase() + t(d.key+'Text').slice(1)}:
                        <strong>${(Constant.currencySymbol || Constant.currencyShort) + ' ' + d.value.toFixed(Constant.roundOffs.sale.amount)}</strong> 
                    `)
                    .style('top', `${event.clientY - containerRect.top + 35}px`);

                d3.select(this).transition().duration(200).attr('opacity', 0.4);
            })
            .on('mousemove', function (event) {
                const containerRect = chartRef.current?.getBoundingClientRect();
                if (!containerRect) return;

                tooltip
                    .style('left', `${event.clientX - containerRect.left - 25}px`)
                    .style('top', `${event.clientY - containerRect.top + 35}px`);
            })
            .on('mouseout', function () {
                tooltip.style('opacity', 0);
                d3.select(this).transition().duration(200).attr('opacity', 0.2);
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

                    const bar = svg.selectAll(`.bar-${d.key}`);
                    const barLabel = svg.selectAll(`.bar-label-${d.key}`);

                    if (activeLines[d.key]) {
                        bar
                            .transition()
                            .duration(1000)
                            .ease(d3.easeCubicOut)
                            .attr('y', (d: any) => yScale(d.value))
                            .attr('height', (d: any) => height - margin.bottom - yScale(d.value))
                            .attr('opacity', 0.2);
                
                        barLabel.transition()
                            .duration(1000)
                            .ease(d3.easeCubicOut)
                            .attr('y', (d: any) => yScale(d.value) - 5)
                            .style('opacity', 1);
                    } else {
                        bar
                            .transition()
                            .duration(1000)
                            .ease(d3.easeCubicIn)
                            .attr('y', height - margin.bottom)
                            .attr('height', 0)
                            .attr('opacity', 0.2);
                
                        barLabel.transition()
                            .duration(1000)
                            .ease(d3.easeCubicIn)
                            .attr('y', height - margin.bottom - 5)
                            .style('opacity', 0);
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

export default SaleCollectionBarChart;