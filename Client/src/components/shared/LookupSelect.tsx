"use client";

import React, { useEffect } from 'react';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import {
    fetchRoles,
    fetchCategories,
    fetchSubCategories,
    fetchUsers,
    fetchStatuses
} from '@/store/slices/lookupSlice';
import { CustomSelect } from './CustomSelect';
import { LucideIcon } from 'lucide-react';

type LookupType = 'roles' | 'categories' | 'subCategories' | 'users' | 'statuses';

interface LookupSelectProps {
    type: LookupType;
    value: string | number;
    onChange: (value: string | number) => void;
    parentId?: number; // For subCategories linked to categories
    placeholder?: string;
    icon?: LucideIcon;
    disabled?: boolean;
    label?: string;
    className?: string;
}

/**
 * A specialized select component that automatically fetches and displays 
 * data from the centralized Lookup Module.
 */
export const LookupSelect: React.FC<LookupSelectProps> = ({
    type,
    value,
    onChange,
    parentId,
    placeholder,
    icon,
    disabled,
    label,
    className
}) => {
    const dispatch = useAppDispatch();
    const lookups = useAppSelector(state => state.lookups);

    useEffect(() => {
        const fetchIfNeeded = async () => {
            switch (type) {
                case 'roles':
                    if (lookups.roles.length === 0) await dispatch(fetchRoles());
                    break;
                case 'categories':
                    if (lookups.categories.length === 0) await dispatch(fetchCategories());
                    break;
                case 'subCategories':
                    // Always refetch subcategories if parent changes, otherwise stick to what we have
                    await dispatch(fetchSubCategories(parentId));
                    break;
                case 'users':
                    if (lookups.users.length === 0) await dispatch(fetchUsers());
                    break;
                case 'statuses':
                    if (lookups.statuses.length === 0) await dispatch(fetchStatuses());
                    break;
            }
        };

        fetchIfNeeded();
    }, [dispatch, type, parentId, lookups.roles.length, lookups.categories.length, lookups.users.length, lookups.statuses.length]);

    const options = lookups[type] || [];

    return (
        <CustomSelect
            options={options}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            icon={icon}
            disabled={disabled}
            label={label}
            className={className}
        />
    );
};
