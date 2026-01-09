import React from 'react';
import { ThemeContainer } from '../types';

interface ThemeContainerProps {
    container: ThemeContainer;
}

export function ThemeContainerComponent({ container }: ThemeContainerProps) {
    return (
        <div
            className="theme-container"
            style={{
                left: container.bounds.x,
                top: container.bounds.y,
                width: container.bounds.width,
                height: container.bounds.height,
                borderColor: container.color,
            }}
        >
            <span className="theme-label">{container.label}</span>
        </div>
    );
}
