// src/components/SearchBox.jsx
import React from 'react';
import { GlobalSearchBar } from '../features/search/GlobalSearchBar';

export function SearchBox(props) {
    return <GlobalSearchBar {...props} />;
}

export default SearchBox;

