import { useState, useRef, useCallback } from 'react';
import { ApiService } from '../../../services/api';

export interface SearchResult {
    success: boolean;
    boxNumber?: number;
    type?: string;
    message?: string;
    from?: 'code' | 'box';
}

export const useSearchLogic = () => {
    const [query, setQuery] = useState('');
    const [loading, setLoading] = useState(false);
    const [searchResult, setSearchResult] = useState<SearchResult>();
    const [foundCodeData, setFoundCodeData] = useState<any>();
    const [lastSearchedCode, setLastSearchedCode] = useState('');

    const timerRef = useRef<number | null>(null);
    const [showAddButton, setShowAddButton] = useState(false);
    const [timerActive, setTimerActive] = useState(false);

    // Таймер для кнопки добавления
    const startTimer = useCallback(() => {
        setShowAddButton(true);
        setTimerActive(true);

        if (timerRef.current) {
            clearTimeout(timerRef.current);
        }

        timerRef.current = setTimeout(() => {
            setShowAddButton(false);
            setTimerActive(false);
            timerRef.current = null;
        }, 60000) as unknown as number;
    }, []);

    const stopTimer = useCallback(() => {
        if (timerRef.current) {
            clearTimeout(timerRef.current);
            timerRef.current = null;
        }
        setShowAddButton(false);
        setTimerActive(false);
    }, []);

    const resetTimer = useCallback(() => {
        stopTimer();
        setShowAddButton(false);
    }, [stopTimer]);

    // Парсинг ответа сервера
    const parseServerResponse = useCallback((data: any): SearchResult => {
        if (data.message && data.message.includes('Ошибка')) {
            return {
                success: false,
                message: 'Код не найден',
            };
        }

        if (data.code) {
            const result: SearchResult = {
                success: true,
                boxNumber: data.code.box_number ? parseInt(data.code.box_number.toString(), 10) : undefined,
                from: data.from || 'code', // Сохраняем from, по умолчанию 'code'
            };

            if (data.code.type) {
                result.type = data.code.type;
            } else if (data.type) {
                result.type = data.type;
            }

            return result;
        }

        return {
            success: false,
            message: 'Код не найден',
        };
    }, []);

    

    // Основная функция поиска
    const handleSearch = useCallback(async () => {
        if (!query.trim() || loading) return;

        setLoading(true);
        setSearchResult(undefined);
        setFoundCodeData(undefined);
        stopTimer();
        setLastSearchedCode(query.trim());

        try {
            const data = await ApiService.searchCode(query);
            const parsedResult = parseServerResponse(data);

            setSearchResult(parsedResult);
            setFoundCodeData(data);

            // Запускаем таймер только если код не найден
            if (!parsedResult.success) {
                startTimer();
            }
        } catch (error: any) {
            const errorResult: SearchResult = {
                success: false,
                message: 'Код не найден',
            };
            setSearchResult(errorResult);
            startTimer();
        } finally {
            setLoading(false);
            setQuery('');
        }
    }, [query, loading, parseServerResponse, startTimer, stopTimer]);

    // Обработчик изменения текста
    const handleQueryChange = useCallback((text: string) => {
        setQuery(text);

        if (text.length > 0) {
            resetTimer();
            setSearchResult(undefined);
            setFoundCodeData(undefined);
            setLastSearchedCode('');
        }
    }, [resetTimer]);

    // Проверка типа кода
    const isCodeType = useCallback(() => {
        if (!foundCodeData) return false;

        if (foundCodeData.code?.type) {
            return foundCodeData.code.type.toLowerCase().includes('код') ||
                foundCodeData.code.type === 'code';
        }

        if (foundCodeData.type) {
            return foundCodeData.type.toLowerCase().includes('код') ||
                foundCodeData.type === 'code';
        }

        return !!(foundCodeData.code?.code);
    }, [foundCodeData]);

    return {
        // Состояния
        query,
        loading,
        searchResult,
        foundCodeData,
        lastSearchedCode,
        showAddButton,
        timerActive,

        // Функции
        setQuery,
        setLoading,
        handleQueryChange,
        handleSearch,
        startTimer,
        stopTimer,
        resetTimer,
        isCodeType,
        resetSearch: useCallback(() => {
            setSearchResult(undefined);
            setFoundCodeData(undefined);
            setLastSearchedCode('');
            resetTimer();
        }, [resetTimer]),
    };
};