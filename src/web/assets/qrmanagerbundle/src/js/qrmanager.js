import QRCodeStyling from "qr-code-styling";

(function() {
    function QrCodeController() {
        this.state = {
            code : null,
            downloadButtonClickListeners: {}
        }
        this.elements = {
            qrCode: null,
            inputs: {
                entryUri : null,
                redirectUri : null,
                fourgroundColor : null,
                backgroundColor : null,
                logo: null,
                dotOptions: null
            },
            canvas: null
        }
        this.config = {
            ENTRY_URI_SELECTOR: '[name*="entryUri"]',
            REDIRECT_URI_SELECTOR: '[name*="redirectUri"]',
        }
        this.generateQrCodes = function() {
            this.elements.qrCodes = document.querySelectorAll('[data-qr-manager-code]');
            console.log('Generating QR codes')
            this.elements.qrCodes.forEach((qrCodeElement) => {
                this.generateQrCode(qrCodeElement, false, qrCodeElement.getAttribute('data-qr-manager-code'), qrCodeElement.getAttribute('data-qr-manager-code-name'));
            });
        }
        this.generateQrCode = function(qrCodeElement = null, download = false, entryUri = null, name = null) {
            console.log(window.QR_MANAGER_CONFIG.QR_CODE_FOREGROUND_COLOR, window.QR_MANAGER_CONFIG.QR_CODE_BACKGROUND_COLOR)
            const qrCodeUrl = window.QR_MANAGER_CONFIG.SITE_BASE_URL + (entryUri ? entryUri : (this.elements.inputs.entryUri ? this.elements.inputs.entryUri.value : ""));
            console.log(window.QR_MANAGER_CONFIG.SITE_BASE_URL, qrCodeUrl);
            let config = {
                width: 1000,
                height: 1000,
                type: download ? "svg" : "canvas",
                margin: 50,
                data: qrCodeUrl,
                qrOptions: {
                    errorCorrectionLevel: this.elements.inputs.errorCorrectionLevel ? this.elements.inputs.errorCorrectionLevel.value : window.QR_MANAGER_CONFIG.QR_CODE_ERROR_CORRECTION ? window.QR_MANAGER_CONFIG.QR_CODE_ERROR_CORRECTION : "H",
                },
                dotsOptions: {
                    color: this.elements.inputs.foregroundColor ? "#" + this.elements.inputs.foregroundColor.value : window.QR_MANAGER_CONFIG.QR_CODE_FOREGROUND_COLOR ? "#" + window.QR_MANAGER_CONFIG.QR_CODE_FOREGROUND_COLOR : "#000000",
                    type: this.elements.inputs.dotOptions ? this.elements.inputs.dotOptions.value : window.QR_MANAGER_CONFIG.QR_CODE_DOT_OPTIONS ? window.QR_MANAGER_CONFIG.QR_CODE_DOT_OPTIONS : "rounded",
                },
                backgroundOptions: {
                    color: this.elements.inputs.backgroundColor ? "#" + this.elements.inputs.backgroundColor.value : window.QR_MANAGER_CONFIG.QR_CODE_BACKGROUND_COLOR ? "#" + window.QR_MANAGER_CONFIG.QR_CODE_BACKGROUND_COLOR : "#ffffff",
                },
                imageOptions: {
                    crossOrigin: "anonymous",
                    imageSize: this.elements.inputs.logoSize ? parseFloat(this.elements.inputs.logoSize.value) : window.QR_MANAGER_CONFIG.QR_CODE_LOGO_SIZE ? window.QR_MANAGER_CONFIG.QR_CODE_LOGO_SIZE : 0,
                    margin: this.elements.inputs.logoMargin ? parseInt(this.elements.inputs.logoMargin.value) : window.QR_MANAGER_CONFIG.QR_CODE_LOGO_MARGIN ? window.QR_MANAGER_CONFIG.QR_CODE_LOGO_MARGIN : 0,
                },
            };

            console.log(config)

            if ( !download ) {
                qrCodeElement.innerHTML = '';
            }

            if ( typeof window.QR_MANAGER_CONFIG.QR_CODE_LOGO != "undefined" || this.elements.inputs.logo ) {
                config.image = typeof window.QR_MANAGER_CONFIG.QR_CODE_LOGO != "undefined" ? window.QR_MANAGER_CONFIG.QR_CODE_LOGO : this.elements.inputs.logo.getAttribute('data-url');
            }
            const qrCode = new QRCodeStyling(config);

            if ( download ) {
                qrCode.download({
                    name: name ?? "qr-code",
                    extension: "svg"
                });
            } else {
                qrCode.append(qrCodeElement);
                qrCode.update();
            }
        }
        this.handleQrCodeEdit = function(e) {
            e.preventDefault();

            const currentTarget = e.currentTarget;

            // Get the route id
            const routeId = currentTarget.getAttribute('data-qr-manager-edit');

            // Post the redirect URI to the controller action
            const slideout = new Craft.CpScreenSlideout('qr-manager/routes/edit/', {
                params : {
                    routeId: routeId
                }
            })
    
            // Open the slideout
            slideout.open();

            slideout.on('load', () => {
                console.log('Slideout opened')
                this.generateQrCodes();
                this.checkForDownloadButtons();
            })
            
            // Listen for the submit event
            slideout.on('submit', function (e) {
                window.location = window.location;
            })
        }
        this.handleDownloadButtonClick = function(e) {
            e.preventDefault();
            const currentTarget = e.currentTarget;
            const entryUri = currentTarget.getAttribute('data-qr-manager-download');
            const name = currentTarget.getAttribute('data-qr-manager-download-name');
            this.generateQrCode(null, true, entryUri, name);
        }
        this.checkForDownloadButtons = function() {
            // Add event listeners for download buttons
            console.log("Listening for download buttons")
            document.querySelectorAll('[data-qr-manager-download]').forEach((button) => {
                console.log(button)
                // Get Name
                const id = button.id;
                // Check if we have event listener
                if ( !this.state.downloadButtonClickListeners.hasOwnProperty(id) ) {
                    this.state.downloadButtonClickListeners[name] = button.addEventListener('click', this.handleDownloadButtonClick.bind(this));
                }
            });
        }
        this.addEventListeners = function() {
            // If we have inputs, add event listeners
            if(this.elements.inputs.foregroundColor && this.elements.inputs.backgroundColor) {
                this.elements.inputs.foregroundColor.addEventListener('change', this.generateQrCodes.bind(this));
                this.elements.inputs.foregroundColorFieldset.querySelector('.color-preview-input').addEventListener('blur', this.generateQrCodes.bind(this));
                this.elements.inputs.backgroundColor.addEventListener('change', this.generateQrCodes.bind(this));
                this.elements.inputs.backgroundColorFieldset.querySelector('.color-preview-input').addEventListener('blur', this.generateQrCodes.bind(this));
                this.elements.inputs.logo.addEventListener('change', this.generateQrCodes.bind(this));
                this.elements.inputs.logoSize.addEventListener('change', this.generateQrCodes.bind(this));
                this.elements.inputs.logoMargin.addEventListener('change', this.generateQrCodes.bind(this));
                this.elements.inputs.errorCorrectionLevel.addEventListener('change', this.generateQrCodes.bind(this));
                this.elements.inputs.dotOptions.addEventListener('change', this.generateQrCodes.bind(this));
            }

            // Check for download buttons
            this.checkForDownloadButtons();

            // Add event listener for edit button
            document.querySelectorAll('[data-qr-manager-edit]').forEach((button) => {
                button.addEventListener('click', this.handleQrCodeEdit.bind(this));
            });

            // If we have entryUri input, add event listener
            if(this.elements.inputs.entryUri) {
                this.elements.inputs.entryUri.addEventListener('input', this.generateQrCodes.bind(this));
            }
        }
        this.init = function() {
            // Get inputs
            this.elements.qrCodes = document.querySelectorAll('[data-qr-manager-code]');
            this.elements.inputs.entryUri = document.querySelector(this.config.ENTRY_URI_SELECTOR);
            this.elements.inputs.redirectUri = document.querySelector(this.config.REDIRECT_URI_SELECTOR);
            this.elements.inputs.foregroundColorFieldset = document.querySelector('#settings-foregroundColor-field');
            this.elements.inputs.foregroundColor = document.querySelector('#settings-foregroundColor-field .color-input');
            this.elements.inputs.backgroundColorFieldset = document.querySelector('#settings-backgroundColor-field');
            this.elements.inputs.backgroundColor = document.querySelector('#settings-backgroundColor-field .color-input');
            this.elements.inputs.errorCorrectionLevel = document.querySelector('#settings-errorCorrectionLevel');
            this.elements.inputs.logo = document.querySelector('#settings-logo .element[data-url]');
            this.elements.inputs.logoSize = document.querySelector('#settings-logoSize');
            this.elements.inputs.logoMargin = document.querySelector('#settings-logoMargin');
            this.elements.inputs.dotOptions = document.querySelector('#settings-dotOptions');

            // Add event listeners
            this.addEventListeners();

            // Generate QR code
            if ( this.elements.qrCodes.length > 0 ) {
                this.generateQrCodes();
            }

            
        }
    }
    
    window.QrCodeController = new QrCodeController()

    console.log('QR Manager bundle loaded')
    
    document.addEventListener('DOMContentLoaded', function() {
        window.QrCodeController.init()
    })
})()