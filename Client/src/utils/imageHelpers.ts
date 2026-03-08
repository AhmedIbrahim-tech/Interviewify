export const CATEGORY_IMAGES = {
    csharp: [
        "https://images.unsplash.com/photo-1516116216624-53e697fedbea?q=80&w=2128&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1550439062-609e1531270e?q=80&w=2070&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1542831371-29b0f74f9713?q=80&w=2070&auto=format&fit=crop"
    ],
    webapi: [
        "https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=2015&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1558494949-ef010cbdcc51?q=80&w=2013&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1515879218367-8466d910aaa4?q=80&w=2069&auto=format&fit=crop"
    ],
    database: [
        "https://images.unsplash.com/photo-1544383335-cce351cc0f3a?q=80&w=2021&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1543674892-7d64d45df18b?q=80&w=2130&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1587620962725-abab7fe55159?q=80&w=2031&auto=format&fit=crop"
    ],
    architecture: [
        "https://images.unsplash.com/photo-1507721999472-8ed4421c4af2?q=80&w=2070&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1531297484001-80022131f5a1?q=80&w=2020&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=2072&auto=format&fit=crop"
    ],
    frontend: [
        "https://images.unsplash.com/photo-1633356122544-f134324a6cee?q=80&w=2070&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1581291518022-e5a6c715cd82?q=80&w=2070&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1517697471339-4aa32003c11d?q=80&w=2070&auto=format&fit=crop"
    ],
    default: [
        "https://images.unsplash.com/photo-1618477388954-7852f32655ec?q=80&w=1964&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1555066931-4365d14bab8c?q=80&w=2070&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1522252234503-e356532cafd5?q=80&w=1925&auto=format&fit=crop"
    ]
};

export const getCategoryImage = (name: string, providedImage?: string, index: number = 0) => {
    if (providedImage) return providedImage;

    const lowerName = name.toLowerCase();
    let pool = CATEGORY_IMAGES.default;

    if (lowerName.includes("c#") || lowerName.includes("dot")) pool = CATEGORY_IMAGES.csharp;
    else if (lowerName.includes("api") || lowerName.includes("asp") || lowerName.includes("web")) pool = CATEGORY_IMAGES.webapi;
    else if (lowerName.includes("ef") || lowerName.includes("entity") || lowerName.includes("database") || lowerName.includes("sql")) pool = CATEGORY_IMAGES.database;
    else if (lowerName.includes("arch") || lowerName.includes("system") || lowerName.includes("design")) pool = CATEGORY_IMAGES.architecture;
    else if (lowerName.includes("front") || lowerName.includes("react") || lowerName.includes("js")) pool = CATEGORY_IMAGES.frontend;

    return pool[index % pool.length];
};
