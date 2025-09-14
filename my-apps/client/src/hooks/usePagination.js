import { useState, useMemo, useCallback } from 'react';

const usePagination = (data, itemsPerPage = 10) => {
    const [currentPage, setCurrentPage] = useState(1);
    
    // ✅ เพิ่ม debug logging
    console.log('usePagination called with:', {
        dataLength: data?.length || 0,
        itemsPerPage,
        currentPage
    });

    // ✅ ตรวจสอบว่า data เป็น array หรือไม่
    const safeData = useMemo(() => {
        if (!Array.isArray(data)) {
            console.warn('usePagination: data is not an array:', data);
            return [];
        }
        return data;
    }, [data]);

    const currentItems = useMemo(() => {
        const indexOfLastItem = currentPage * itemsPerPage;
        const indexOfFirstItem = indexOfLastItem - itemsPerPage;
        
        console.log('Calculating currentItems:', {
            currentPage,
            itemsPerPage,
            indexOfFirstItem,
            indexOfLastItem,
            totalData: safeData.length
        });
        
        const items = safeData.slice(indexOfFirstItem, indexOfLastItem);
        console.log('Current items result:', items.length);
        
        return items;
    }, [safeData, currentPage, itemsPerPage]);

    const totalPages = useMemo(() => {
        const pages = Math.ceil(safeData.length / itemsPerPage);
        console.log('Total pages calculated:', pages);
        return pages;
    }, [safeData.length, itemsPerPage]);

    // ✅ ใช้ useCallback เพื่อป้องกัน re-render ที่ไม่จำเป็น
    const goToPage = useCallback((page) => {
        const newPage = Math.max(1, Math.min(page, totalPages));
        console.log('goToPage called:', {
            requestedPage: page,
            newPage,
            totalPages,
            currentPage
        });
        
        if (newPage !== currentPage) {
            setCurrentPage(newPage);
        }
    }, [totalPages, currentPage]);

    const nextPage = useCallback(() => {
        console.log('nextPage called - current:', currentPage, 'total:', totalPages);
        if (currentPage < totalPages) {
            goToPage(currentPage + 1);
        } else {
            console.log('Cannot go to next page - already at last page');
        }
    }, [currentPage, totalPages, goToPage]);

    const prevPage = useCallback(() => {
        console.log('prevPage called - current:', currentPage);
        if (currentPage > 1) {
            goToPage(currentPage - 1);
        } else {
            console.log('Cannot go to previous page - already at first page');
        }
    }, [currentPage, goToPage]);

    // ✅ Reset page to 1 when data changes
    useMemo(() => {
        if (currentPage > totalPages && totalPages > 0) {
            console.log('Resetting page to 1 - current page exceeds total pages');
            setCurrentPage(1);
        }
    }, [totalPages, currentPage]);

    return {
        currentItems,
        currentPage,
        totalPages,
        goToPage,
        nextPage,
        prevPage,
        // ✅ เพิ่ม helper functions
        hasNextPage: currentPage < totalPages,
        hasPrevPage: currentPage > 1,
        startIndex: (currentPage - 1) * itemsPerPage + 1,
        endIndex: Math.min(currentPage * itemsPerPage, safeData.length),
        totalItems: safeData.length
    };
};

export default usePagination;