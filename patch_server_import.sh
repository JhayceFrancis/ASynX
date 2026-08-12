#!/bin/bash
cat << 'ROUTE' >> server.ts

// Library Import Mechanism
app.post("/api/library/import", (req, res) => {
  const { items } = req.body;
  if (!items || !Array.isArray(items)) {
    return res.status(400).json({ error: "Invalid import format" });
  }
  
  items.forEach(newItem => {
    // Generate an ID if needed
    if (!newItem.id) newItem.id = `item-${Date.now()}-${Math.floor(Math.random()*1000)}`;
    
    // Check if it already exists
    const exists = libraryItems.find(i => i.title === newItem.title || i.id === newItem.id);
    if (!exists) {
      libraryItems.unshift(newItem);
    }
  });

  res.json({ success: true, importedCount: items.length, libraryItems });
});
ROUTE
