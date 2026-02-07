'use client';

import { useState } from 'react';
import styles from './filters.module.css';

interface ProductFiltersProps {
    onFilterChange: (filters: FilterState) => void;
}

export interface FilterState {
    priceRange: [number, number];
    sizes: string[];
    colors: string[];
    brands: string[];
    sortBy: string;
}

const AVAILABLE_SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
const AVAILABLE_COLORS = ['Noir', 'Blanc', 'Rouge', 'Bleu', 'Vert', 'Rose'];
const AVAILABLE_BRANDS = ['Zara', 'H&M', 'Mango', 'Reserved', 'Bershka'];

export default function ProductFilters({ onFilterChange }: ProductFiltersProps) {
    const [filters, setFilters] = useState<FilterState>({
        priceRange: [0, 500],
        sizes: [],
        colors: [],
        brands: [],
        sortBy: 'newest',
    });

    const [showFilters, setShowFilters] = useState(false);

    const updateFilters = (newFilters: Partial<FilterState>) => {
        const updated = { ...filters, ...newFilters };
        setFilters(updated);
        onFilterChange(updated);
    };

    const toggleArrayFilter = (key: 'sizes' | 'colors' | 'brands', value: string) => {
        const current = filters[key];
        const updated = current.includes(value)
            ? current.filter(item => item !== value)
            : [...current, value];
        updateFilters({ [key]: updated });
    };

    const clearFilters = () => {
        const cleared: FilterState = {
            priceRange: [0, 500],
            sizes: [],
            colors: [],
            brands: [],
            sortBy: 'newest',
        };
        setFilters(cleared);
        onFilterChange(cleared);
    };

    const hasActiveFilters = filters.sizes.length > 0 || filters.colors.length > 0 ||
        filters.brands.length > 0 || filters.priceRange[0] > 0 || filters.priceRange[1] < 500;

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <button onClick={() => setShowFilters(!showFilters)} className={styles.toggleBtn}>
                    {showFilters ? '✕ Masquer les filtres' : '☰ Afficher les filtres'}
                </button>
                {hasActiveFilters && (
                    <button onClick={clearFilters} className={styles.clearBtn}>
                        Effacer les filtres
                    </button>
                )}
            </div>

            {showFilters && (
                <div className={styles.filtersPanel}>
                    {/* Sort By */}
                    <div className={styles.filterSection}>
                        <label className={styles.filterLabel}>Trier par</label>
                        <select
                            value={filters.sortBy}
                            onChange={(e) => updateFilters({ sortBy: e.target.value })}
                            className={styles.select}
                        >
                            <option value="newest">Nouveautés</option>
                            <option value="price-asc">Prix croissant</option>
                            <option value="price-desc">Prix décroissant</option>
                            <option value="name">Nom A-Z</option>
                        </select>
                    </div>

                    {/* Price Range */}
                    <div className={styles.filterSection}>
                        <label className={styles.filterLabel}>
                            Prix: {filters.priceRange[0]} DT - {filters.priceRange[1]} DT
                        </label>
                        <div className={styles.priceInputs}>
                            <input
                                type="number"
                                value={filters.priceRange[0]}
                                onChange={(e) => updateFilters({ priceRange: [parseInt(e.target.value) || 0, filters.priceRange[1]] })}
                                className={styles.priceInput}
                                placeholder="Min"
                            />
                            <span>-</span>
                            <input
                                type="number"
                                value={filters.priceRange[1]}
                                onChange={(e) => updateFilters({ priceRange: [filters.priceRange[0], parseInt(e.target.value) || 500] })}
                                className={styles.priceInput}
                                placeholder="Max"
                            />
                        </div>
                    </div>

                    {/* Sizes */}
                    <div className={styles.filterSection}>
                        <label className={styles.filterLabel}>Tailles</label>
                        <div className={styles.chips}>
                            {AVAILABLE_SIZES.map(size => (
                                <button
                                    key={size}
                                    onClick={() => toggleArrayFilter('sizes', size)}
                                    className={`${styles.chip} ${filters.sizes.includes(size) ? styles.chipActive : ''}`}
                                >
                                    {size}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Colors */}
                    <div className={styles.filterSection}>
                        <label className={styles.filterLabel}>Couleurs</label>
                        <div className={styles.chips}>
                            {AVAILABLE_COLORS.map(color => (
                                <button
                                    key={color}
                                    onClick={() => toggleArrayFilter('colors', color)}
                                    className={`${styles.chip} ${filters.colors.includes(color) ? styles.chipActive : ''}`}
                                >
                                    {color}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Brands */}
                    <div className={styles.filterSection}>
                        <label className={styles.filterLabel}>Marques</label>
                        <div className={styles.chips}>
                            {AVAILABLE_BRANDS.map(brand => (
                                <button
                                    key={brand}
                                    onClick={() => toggleArrayFilter('brands', brand)}
                                    className={`${styles.chip} ${filters.brands.includes(brand) ? styles.chipActive : ''}`}
                                >
                                    {brand}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
