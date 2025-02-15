import { nodeListForEach } from './helpers.mjs'

var navActiveClass = 'app-navigation--active'
var navMenuButtonActiveClass = 'govuk-header__menu-button--open'
var subNavActiveClass = 'app-navigation__subnav--active'
// This one has the query dot at the beginning because it's only ever used in querySelector calls
var subNavJSClass = '.js-app-navigation__subnav'

function Navigation ($module) {
  this.$module = $module || document

  this.$nav = this.$module.querySelector('.js-app-navigation')
  this.$navToggler = this.$module.querySelector('.js-app-navigation__toggler')
  this.$navButtons = this.$module.querySelectorAll('.js-app-navigation__button')
  this.$navLinks = this.$module.querySelectorAll('.js-app-navigation__link')

  // Save the opened/closed state for the nav in memory so that we can accurately maintain state when the screen is changed from small to big and back to small
  this.mobileNavOpen = false

  // A global const for storing a matchMedia instance which we'll use to detect when a screen size change happens
  // We set this later during the init function and rely on it being null if the feature isn't available to initially apply hidden attributes
  this.mql = null
}

// Checks if the saved window size has changed between now and when it was last recorded (on load and on viewport width changes)
// Reapplies hidden attributes based on if the viewport has changed from big to small or vice verca
// Saves the new window size

Navigation.prototype.setHiddenStates = function () {
  if (this.mql === null || !this.mql.matches) {
    if (!this.mobileNavOpen) {
      this.$nav.setAttribute('hidden', '')
    }

    nodeListForEach(this.$navLinks, function ($navLink, index) {
      $navLink.setAttribute('hidden', '')
    })

    nodeListForEach(this.$navButtons, function ($navButton, index) {
      $navButton.removeAttribute('hidden')
    })

    this.$navToggler.removeAttribute('hidden')
  } else if (this.mql === null || this.mql.matches) {
    this.$nav.removeAttribute('hidden')

    nodeListForEach(this.$navLinks, function ($navLink, index) {
      $navLink.removeAttribute('hidden')
    })

    nodeListForEach(this.$navButtons, function ($navButton, index) {
      $navButton.setAttribute('hidden', '')
    })

    this.$navToggler.setAttribute('hidden', '')
  }
}

Navigation.prototype.setInitialAriaStates = function () {
  this.$navToggler.setAttribute('aria-expanded', 'false')

  nodeListForEach(this.$navButtons, function ($button, index) {
    var $nextSubNav = $button.parentNode.querySelector(subNavJSClass)

    if ($nextSubNav) {
      var subNavTogglerId = 'js-mobile-nav-subnav-toggler-' + index
      var nextSubNavId = 'js-mobile-nav__subnav-' + index

      $nextSubNav.setAttribute('id', nextSubNavId)
      $button.setAttribute('id', subNavTogglerId)
      $button.setAttribute('aria-expanded', $nextSubNav.hasAttribute('hidden') ? 'false' : 'true')
      $button.setAttribute('aria-controls', nextSubNavId)
    }
  })
}

Navigation.prototype.bindUIEvents = function () {
  var $nav = this.$nav
  var $navToggler = this.$navToggler
  var $navButtons = this.$navButtons

  $navToggler.addEventListener('click', function (event) {
    if (this.mobileNavOpen) {
      $nav.classList.remove(navActiveClass)
      $navToggler.classList.remove(navMenuButtonActiveClass)
      $nav.setAttribute('hidden', '')

      $navToggler.setAttribute('aria-expanded', 'false')

      this.mobileNavOpen = false
    } else {
      $nav.classList.add(navActiveClass)
      $navToggler.classList.add(navMenuButtonActiveClass)
      $nav.removeAttribute('hidden')

      $navToggler.setAttribute('aria-expanded', 'true')

      this.mobileNavOpen = true
    }
  }.bind(this))

  nodeListForEach($navButtons, function ($button, index) {
    $button.addEventListener('click', function (event) {
      var $nextSubNav = $button.parentNode.querySelector(subNavJSClass)

      if ($nextSubNav) {
        if ($nextSubNav.hasAttribute('hidden')) {
          $nextSubNav.classList.add(subNavActiveClass)

          $nextSubNav.removeAttribute('hidden')
          $button.setAttribute('aria-expanded', 'true')
        } else {
          $nextSubNav.classList.remove(subNavActiveClass)

          $nextSubNav.setAttribute('hidden', '')
          $button.setAttribute('aria-expanded', 'false')
        }
      }
    })
  })
}

Navigation.prototype.init = function () {
  if ('matchMedia' in window) {
    // Set the matchMedia to the govuk-frontend tablet breakpoint
    this.mql = window.matchMedia('(min-width: 40.0625em)')

    if ('addEventListener' in this.mql) {
      this.mql.addEventListener('change', this.setHiddenStates.bind(this))
    } else {
      // addListener is a deprecated function, however addEventListener
      // isn't supported by Safari < 14. We therefore add this in as
      // a fallback for those browsers
      this.mql.addListener(this.setHiddenStates.bind(this))
    }
  }

  this.setHiddenStates()
  this.setInitialAriaStates()
  this.bindUIEvents()
}

export default Navigation
