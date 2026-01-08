import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AppState } from '../../state.js';

describe('AppState', () => {
    let appState;

    beforeEach(() => {
        // Mock localStorage
        const localStorageMock = (function() {
            let store = {};
            return {
                getItem: function(key) {
                    return store[key] || null;
                },
                setItem: function(key, value) {
                    store[key] = value.toString();
                },
                clear: function() {
                    store = {};
                }
            };
        })();
        Object.defineProperty(window, 'localStorage', {
            value: localStorageMock
        });

        appState = new AppState();
    });

    it('should initialize with default values', () => {
        expect(appState.language).toBe('en');
        expect(appState.itinerary).toEqual([]);
    });

    it('should add item to itinerary', () => {
        appState.addToItinerary('Tirana');
        expect(appState.itinerary).toContain('Tirana');
        expect(JSON.parse(localStorage.getItem('albania_itinerary'))).toContain('Tirana');
    });

    it('should not add duplicate items to itinerary', () => {
        appState.addToItinerary('Tirana');
        appState.addToItinerary('Tirana');
        expect(appState.itinerary.length).toBe(1);
    });

    it('should remove item from itinerary', () => {
        appState.addToItinerary('Tirana');
        appState.removeFromItinerary('Tirana');
        expect(appState.itinerary).not.toContain('Tirana');
    });

    it('should reorder items', () => {
        appState.setItinerary(['A', 'B', 'C']);
        appState.moveItemUp('B'); // Should become A, B -> B, A ? Wait.
        // Code: index of B is 1. index-1 is 0 (A). Swap.
        // Result: B, A, C
        expect(appState.itinerary).toEqual(['B', 'A', 'C']);

        appState.moveItemDown('B'); // B is at 0. index+1 is 1 (A). Swap.
        // Result: A, B, C
        expect(appState.itinerary).toEqual(['A', 'B', 'C']);
    });

    it('should subscribe and notify', () => {
        const callback = vi.fn();
        appState.subscribe('testEvent', callback);
        appState.notify('testEvent', 'data');
        expect(callback).toHaveBeenCalledWith('data');
    });
});
