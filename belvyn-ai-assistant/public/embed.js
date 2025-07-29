;(() => {
  // Prevent multiple initializations
  if (window.BelvynChat) return

  const WIDGET_URL = window.location.origin + "/widget"

  // Create the floating button
  function createFloatingButton() {
    const button = document.createElement("button")
    button.id = "belvyn-chat-button"
    button.innerHTML = `
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
      </svg>
    `

    // Styles
    Object.assign(button.style, {
      position: "fixed",
      bottom: "24px",
      right: "24px",
      width: "60px",
      height: "60px",
      borderRadius: "50%",
      backgroundColor: "#4316B8",
      color: "white",
      border: "none",
      cursor: "pointer",
      boxShadow: "0 4px 20px rgba(67, 22, 184, 0.4), 0 0 20px rgba(67, 22, 184, 0.3)",
      zIndex: "999999",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      transition: "all 0.3s ease",
      fontSize: "0",
      outline: "none",
    })

    // Hover effects
    button.addEventListener("mouseenter", function () {
      this.style.backgroundColor = "#5A2BC7"
      this.style.transform = "scale(1.05)"
    })

    button.addEventListener("mouseleave", function () {
      this.style.backgroundColor = "#4316B8"
      this.style.transform = "scale(1)"
    })

    // Click handler
    button.addEventListener("click", () => {
      window.BelvynChat.open()
    })

    document.body.appendChild(button)
    return button
  }

  // Create the widget
  function createWidget() {
    const widget = document.createElement("div")
    widget.id = "belvyn-chat-widget"

    Object.assign(widget.style, {
      position: "fixed",
      bottom: "100px",
      right: "24px",
      width: "min(400px, 30vw)",
      height: "min(600px, 70vh)",
      minWidth: "320px",
      minHeight: "400px",
      backgroundColor: "#0B0B10",
      borderRadius: "20px",
      overflow: "hidden",
      boxShadow: "0 20px 60px rgba(0, 0, 0, 0.5), 0 0 20px rgba(67, 22, 184, 0.3)",
      zIndex: "999998",
      display: "none",
      transition: "all 0.3s ease",
      border: "1px solid #26262D",
    })

    // Mobile responsive
    if (window.innerWidth <= 768) {
      Object.assign(widget.style, {
        width: "calc(100vw - 48px)",
        height: "70vh",
        right: "24px",
        bottom: "100px",
      })
    }

    // Create iframe
    const iframe = document.createElement("iframe")
    iframe.src = WIDGET_URL
    Object.assign(iframe.style, {
      width: "100%",
      height: "100%",
      border: "none",
      borderRadius: "20px",
    })

    widget.appendChild(iframe)

    // Listen for close messages from iframe
    window.addEventListener("message", (event) => {
      if (event.data.type === "CLOSE_BELVYN_CHAT") {
        window.BelvynChat.close()
      }
    })

    document.body.appendChild(widget)
    return widget
  }

  // Initialize
  function init() {
    const button = createFloatingButton()
    const widget = createWidget()

    // Public API
    window.BelvynChat = {
      open: () => {
        widget.style.display = "block"

        // Focus management
        setTimeout(() => {
          const iframe = widget.querySelector("iframe")
          if (iframe) iframe.focus()
        }, 100)
      },

      close: () => {
        widget.style.display = "none"
      },

      toggle: function () {
        if (widget.style.display === "block") {
          this.close()
        } else {
          this.open()
        }
      },
    }

    // Handle window resize
    window.addEventListener("resize", () => {
      if (window.innerWidth <= 768) {
        Object.assign(widget.style, {
          width: "calc(100vw - 48px)",
          height: "70vh",
          right: "24px",
          bottom: "100px",
        })
      } else {
        Object.assign(widget.style, {
          width: "min(400px, 30vw)",
          height: "min(600px, 70vh)",
          right: "24px",
          bottom: "100px",
        })
      }
    })

    // Close widget when clicking outside
    document.addEventListener("click", (e) => {
      if (widget.style.display === "block" && !widget.contains(e.target) && !button.contains(e.target)) {
        window.BelvynChat.close()
      }
    })
  }

  // Initialize when DOM is ready
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init)
  } else {
    init()
  }
})()
