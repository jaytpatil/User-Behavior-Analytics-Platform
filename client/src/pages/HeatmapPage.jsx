import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import Header from '../components/common/Header';
import PageSelector from '../components/heatmap/PageSelector';
import HeatmapCanvas from '../components/heatmap/HeatmapCanvas';
import LoadingState from '../components/common/LoadingState';
import ErrorState from '../components/common/ErrorState';
import EmptyState from '../components/common/EmptyState';
import { fetchDistinctPages, fetchHeatmapData, fetchHealth } from '../services/api';

export default function HeatmapPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const urlParam = searchParams.get('url');

  const [pages, setPages] = useState([]);
  const [selectedUrl, setSelectedUrl] = useState('');
  const [heatmapData, setHeatmapData] = useState(null);
  const [isLoadingPages, setIsLoadingPages] = useState(true);
  const [isLoadingHeatmap, setIsLoadingHeatmap] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [isConnected, setIsConnected] = useState(true);

  // Load distinct pages list on mount
  useEffect(() => {
    const loadPages = async () => {
      setIsLoadingPages(true);
      try {
        const [pagesRes, healthRes] = await Promise.all([
          fetchDistinctPages(),
          fetchHealth().catch(() => ({ success: false })),
        ]);

        if (pagesRes.success && pagesRes.data.length > 0) {
          setPages(pagesRes.data);

          // Select page from URL param or default to first page
          const targetUrl = urlParam || pagesRes.data[0].url;
          setSelectedUrl(targetUrl);
        }
        setIsConnected(healthRes.success !== false);
      } catch (err) {
        console.error('Failed to load tracked pages:', err);
        setError('Unable to load pages from server.');
        setIsConnected(false);
      } finally {
        setIsLoadingPages(false);
      }
    };

    loadPages();
  }, []);

  // Fetch heatmap data whenever selectedUrl changes
  const loadHeatmap = async (targetUrl = selectedUrl, showRefresh = false) => {
    if (!targetUrl) return;
    if (showRefresh) setIsRefreshing(true);
    else setIsLoadingHeatmap(true);
    setError(null);

    try {
      const res = await fetchHeatmapData(targetUrl);
      if (res.success) {
        setHeatmapData(res.data);
      } else {
        setError(res.message || 'Failed to load heatmap data');
      }
    } catch (err) {
      console.error('Error fetching heatmap:', err);
      setError('Could not load click coordinates for the selected URL.');
    } finally {
      setIsLoadingHeatmap(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    if (selectedUrl) {
      setSearchParams({ url: selectedUrl });
      loadHeatmap(selectedUrl);
    }
  }, [selectedUrl]);

  const handleSelectPage = (newUrl) => {
    setSelectedUrl(newUrl);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Header
        title="Click Heatmap Visualization"
        subtitle="Visual user engagement, click density clusters, and coordinate mapping"
        onRefresh={() => loadHeatmap(selectedUrl, true)}
        isRefreshing={isRefreshing}
        isConnected={isConnected}
      />

      <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto space-y-6">
        {/* Page Selector Bar */}
        <PageSelector
          pages={pages}
          selectedUrl={selectedUrl}
          onSelectPage={handleSelectPage}
          isLoading={isLoadingPages || isLoadingHeatmap}
        />

        {error ? (
          <ErrorState message={error} onRetry={() => loadHeatmap(selectedUrl)} />
        ) : isLoadingPages || isLoadingHeatmap ? (
          <LoadingState message="Rendering click heatmap..." />
        ) : pages.length === 0 ? (
          <EmptyState
            title="No Tracked Pages Found"
            message="No pages have recorded events yet. Open the demo store and click on elements to populate heatmap data."
          />
        ) : (
          <HeatmapCanvas
            clicks={heatmapData?.clicks || []}
            viewports={heatmapData?.viewports || []}
            totalClicks={heatmapData?.total_clicks || 0}
            pageUrl={selectedUrl}
          />
        )}
      </main>
    </div>
  );
}
