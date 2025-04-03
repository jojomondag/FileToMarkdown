/**
 * Custom Tooltip Manager
 * Manages tooltips for preset buttons and other elements with data-tooltip attributes
 */

// This is a self-executing function that creates the tooltip manager
(function() {
    // Create a tooltip element to be reused
    const tooltipElement = document.createElement('div');
    tooltipElement.className = 'custom-tooltip';
    tooltipElement.style.display = 'none';
    
    // Add tooltip element to the document body when it's fully loaded
    if (document.body) {
        document.body.appendChild(tooltipElement);
    } else {
        window.addEventListener('DOMContentLoaded', () => {
            document.body.appendChild(tooltipElement);
        });
    }
    
    // Handle mouseover events
    function handleMouseOver(event) {
        // Check if target or any parent has data-tooltip
        const target = event.target.closest('[data-tooltip]');
        if (!target) return;
        
        // Get tooltip text
        const tooltipText = target.dataset.tooltip;
        if (!tooltipText) return;
        
        // Calculate position
        const rect = target.getBoundingClientRect();
        
        // Position the tooltip inline with the button at the same height
        // Calculate vertical center of the button
        const buttonCenterY = rect.top + (rect.height / 2);
        
        // Position the tooltip based on the element's position
        tooltipElement.innerHTML = tooltipText.replace(/\n/g, '<br>');
        
        // Set top to center of button, minus half of tooltip height (after it's rendered)
        tooltipElement.style.display = 'block';
        const tooltipHeight = tooltipElement.offsetHeight;
        tooltipElement.style.top = `${buttonCenterY - (tooltipHeight / 2)}px`;
        tooltipElement.style.left = `${rect.right + 10}px`;
    }
    
    // Handle mouseout events
    function handleMouseOut(event) {
        // Check if we're moving from an element with a tooltip to another element
        const target = event.target.closest('[data-tooltip]');
        const relatedTarget = event.relatedTarget ? event.relatedTarget.closest('[data-tooltip]') : null;
        
        // Only hide if we're not moving to another tooltip element
        if (target && target !== relatedTarget) {
            tooltipElement.style.display = 'none';
        }
    }
    
    // Set up event listeners
    document.addEventListener('mouseover', handleMouseOver);
    document.addEventListener('mouseout', handleMouseOut);
    
    // Make it globally available for debugging if needed
    window.tooltipManager = {
        showTooltip: function(element, text) {
            if (!element) return;
            
            const rect = element.getBoundingClientRect();
            tooltipElement.innerHTML = text.replace(/\n/g, '<br>');
            
            // Position at same height as button
            const buttonCenterY = rect.top + (rect.height / 2);
            tooltipElement.style.display = 'block';
            const tooltipHeight = tooltipElement.offsetHeight;
            tooltipElement.style.top = `${buttonCenterY - (tooltipHeight / 2)}px`;
            tooltipElement.style.left = `${rect.right + 10}px`;
        },
        hideTooltip: function() {
            tooltipElement.style.display = 'none';
        }
    };
})(); 