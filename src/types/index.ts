// Smart Card data model
export type Status = 'draft' | 'investigating' | 'committed';
export type Effort = 'S' | 'M' | 'L' | 'XL';
export type UserRole = 'pm' | 'engineering' | 'design' | 'data';
export type Lens = 'default' | 'engineering' | 'design' | 'data';

export interface RICEScore {
    reach: number;      // 0-10
    impact: number;     // 0-10
    confidence: number; // 0-10
    effort: number;     // 0-10
}

export interface SmartCard {
    id: string;
    type: 'sticky' | 'text' | 'shape' | 'icon' | 'image' | 'framework'; // Expanded types
    shapeType?: 'rectangle' | 'circle' | 'triangle' | 'star' | 'diamond'; // For shapes
    iconName?: string; // For lucide icons
    imageUrl?: string; // For images
    board: Lens;  // Which team board this card belongs to
    position: { x: number; y: number };
    width: number;
    height: number;
    fontSize: number;  // Added font size
    color?: string;    // Added color for sticky notes
    textAlign?: 'left' | 'center' | 'right'; // Added text alignment
    fontWeight?: string | number; // Added font weight
    fontStyle?: string; // Added font style
    textColor?: string; // Added text color
    title: string;
    description: string;
    status: Status;
    source: string;
    effort: Effort | null;
    rice: RICEScore;
    attachments: string[];
    blockedBy: string[];       // IDs of blocking cards
    timelineMonth: string | null;  // null = not on timeline
    votes: number;             // For voting mode
    createdAt: number;
    updatedAt: number;
}

export interface Connector {
    id: string;
    fromCardId: string;
    toCardId: string;
    isBlocker: boolean;
}

export interface Drawing {
    id: string;
    points: { x: number; y: number }[];
    color: string;
    width: number;
}

export interface ThemeContainer {
    id: string;
    board: Lens;  // Which team board this area belongs to
    label: string;
    cardIds: string[];
    bounds: { x: number; y: number; width: number; height: number };
    color: string;
    isLocked?: boolean;
}

export interface FeedbackItem {
    id: string;
    text: string;
    source: string;
    timestamp: number;
}

export interface Cursor {
    id: string;
    name: string;
    color: string;
    position: { x: number; y: number };
}

export interface TimelineMonth {
    id: string;
    name: string;
    maxVelocity: number;
    currentVelocity: number;
}

export interface CanvasState {
    cards: SmartCard[];
    connectors: Connector[];
    drawings: Drawing[];
    themeContainers: ThemeContainer[];
    cursors: Cursor[];
    timeline: TimelineMonth[];
}

// Effort to points mapping
export const EFFORT_POINTS: Record<Effort, number> = {
    'S': 5,
    'M': 10,
    'L': 20,
    'XL': 40,
};
