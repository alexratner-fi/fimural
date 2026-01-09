import { useCanvasStore } from '../store/canvasStore';

export function RemoteCursors() {
    const { cursors } = useCanvasStore();

    return (
        <>
            {cursors.map((cursor) => (
                <div
                    key={cursor.id}
                    className="remote-cursor"
                    style={{
                        position: 'absolute',
                        left: 0,
                        top: 0,
                        transform: `translate(${cursor.position.x}px, ${cursor.position.y}px)`,
                        color: cursor.color,
                        pointerEvents: 'none',
                        zIndex: 1000,
                        transition: 'transform 0.1s linear'
                    }}
                >
                    <svg
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                    >
                        <path
                            d="M5.65376 12.3673H5.46026L5.31717 12.4976L0.500002 16.8829L0.500002 1.19841L11.7841 12.3673H5.65376Z"
                            fill="currentColor"
                            stroke="white"
                        />
                    </svg>
                    <div
                        style={{
                            backgroundColor: cursor.color,
                            color: 'white',
                            fontSize: '10px',
                            fontWeight: 'bold',
                            padding: '2px 6px',
                            borderRadius: '4px',
                            whiteSpace: 'nowrap',
                            marginLeft: '12px',
                            marginTop: '-4px',
                            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                        }}
                    >
                        {cursor.name}
                    </div>
                </div>
            ))}
        </>
    );
}
