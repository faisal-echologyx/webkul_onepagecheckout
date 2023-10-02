function GFG_Fun() {
    document.getElementById("small-info-cart-section").style.display = "none";
    jQuery('#launcher').css('bottom','160px');
    jQuery('.my-summary-box-title-data-info').slideToggle();
    //document.getElementById("my-summary-box-title-data-info").style.display = "flex";
    jQuery('.my-summary-box-full-data-info').slideToggle();
    if(document.getElementById("update-item-count-box").innerHTML == 1) {
        document.getElementById("total-items-text").innerHTML = "&nbsp; Item In Cart ";
    }else{
        document.getElementById("total-items-text").innerHTML = "&nbsp; Items in Cart ";
    }
}
function GFG_Fun_new() {
    jQuery('#launcher').css('bottom','75px');
    jQuery('.my-summary-box-title-data-info').slideToggle();
    jQuery('.my-summary-box-full-data-info').slideToggle();
    document.getElementById("small-info-cart-section").style.display = "block";

}
    require(['jquery'],function($){
                
        $(document).ready( function () {
            //console.log("111mycheckout-----------");

            boxElem = document.querySelector('.onestepcheckout-index-index')
  
		let resizeObserver = new ResizeObserver((entries) => {
			for (entry of entries) {

				// get the height and width of the element
				//console.log('Height: ', entry.contentRect.height);
				//console.log('Width:', entry.contentRect.width);
				if(entry.contentRect.width < 768){
					if($('#small-info-cart-section').css('display') == 'block'){
                        $('#launcher').css('bottom','75px');
					}else{
                        $('#launcher').css('bottom','160px');
					}
				}
			}
		});

		// observe the given element for changes
		resizeObserver.observe(boxElem);


           // var shippingForm = $('#co-shipping-form');

            //console.log("2222mycheckout-----------");

          /*   $('.my-summary-box').click(function (event) {
                if ($('.checkout-cart-summary-mobile-box').attr('aria-expanded') === "true") {
                    console.log("pppppp");
                }else{
                    console.log("rrrr");
                }
               if (this.checked) {
                    document.getElementById("vat-info").innerHTML = "inc <strong>VAT</strong>";
                    var x = document.querySelectorAll(".price-box .price-excluding-tax .price");
                    for (var i = 0; i < x.length; i++) {
                        x[i].style.display = "none";
                    }
                    var y = document.querySelectorAll(".price-box .price-including-tax .price");
                    for (var i = 0; i < y.length; i++) {
                        y[i].style.display = "block";
                    }
                } else {
                    document.getElementById("vat-info").innerHTML = "exc <strong>VAT</strong>";
                    var x = document.querySelectorAll(".price-box .price-excluding-tax .price");
                    for (var i = 0; i < x.length; i++) {
                        x[i].style.display = "block";
                    }
                    var y = document.querySelectorAll(".price-box .price-including-tax .price");
                    for (var i = 0; i < y.length; i++) {
                        y[i].style.display = "none";
                    }
                }
            });*/
    
            // Select the node that will be observed for mutations
          //  var targetNode = document.querySelector('.my-summary-box-full-data-info');

            //console.log("Mutation target");

            // Callback function to execute when mutations are observed
           // var callback = (mutationList, observer) => {

              /*  var selectedPrice = document.querySelector(".title");
                console.log("pppppp");
                console.log(selectedPrice);
                var selectedItemNumber = document.querySelector(".amount");
                console.log("rrrrr");
                console.log(selectedItemNumber);*/

               // document.getElementById("my-estimated-cart-price").innerHTML = selectedPrice.innerHTML;
               // document.getElementById("my-estimated-item-count").innerHTML = selectedItemNumber.innerHTML;
                
                //console.log(document.getElementById("update-item-count"));
                //console.log(document.getElementById("update-item-count").innerHTML);
               /* var count0 = "<!-- ko text: getCartParam('summary_count') --><!-- /ko -->";
                var count1 = "<!-- ko text: getCartParam('summary_count') -->1<!-- /ko -->";
                if(document.getElementById("update-item-count").innerHTML == 0 || document.getElementById("update-item-count").innerHTML == count0){
                    //console.log("NONEEEEEEE");
                    document.getElementById("pdp-footer-minicart").style.display = "none";
                }else if(document.getElementById("update-item-count").innerHTML == count1)
                {
                    //var w = (window.innerWidth > 0) ? window.innerWidth : screen.width;
                    //console.log("wwwww");
                    //console.log(w);
                    //(w < 520){
                        document.getElementById("total-items").innerHTML = "Total <br /> item";
                        document.getElementById("pdp-footer-minicart").style.display = "flex";
                    //}else{
                    //	document.getElementById("pdp-footer-minicart").style.display = "none";
                    //}
                }else{
                    //var w = (window.innerWidth > 0) ? window.innerWidth : screen.width;
                    //console.log("wwwww");
                    //console.log(w);
                    //if(w < 520){
                        document.getElementById("total-items").innerHTML = "Total <br /> items";
                    document.getElementById("pdp-footer-minicart").style.display = "flex";
                    //}else{
                    //	document.getElementById("pdp-footer-minicart").style.display = "none";
                    //}
                }*/

         //   };

            // Create an observer instance linked to the callback function
          /*  var observer = new MutationObserver( callback );
            var config = { characterData: true,
                        attributes: false,
                        childList: true,
                        subtree: true };

            // Start observing the target node for configured mutations
            observer.observe(targetNode, config);*/
            // Later, you can stop observing
            //observer.disconnect();

	    });
    
    });


    require(['jquery', 'Magento_Checkout/js/model/shipping-save-processor/default', 'mage/validation'], function($, shippingSaveProcessor) {
        $(document).ready(function() {

            // If no post code entered then disable the payment
            $(document).on('keyup','[name="shippingAddress.postcode"] input',function(){
                if(!$('[name="shippingAddress.postcode"] input').val()){
                    $('#checkout-step-payment').addClass('disable');
                }else{
                    $('#checkout-step-payment').removeClass('disable');
                }
            })


            function validateShippingAddressForm(isLabel = true) {
                var isValid = true;

                $(document).on('keyup','[name^="shippingAddress"]',function(){
                    if($(this).find('input').val()){
                        $(this).find('.mage-error').remove();
                    }
                })

                var shouldValidate = false;
                if( $('.modal-popup.modal-slide._inner-scroll._show [name^="shippingAddress"]').length > 0 ||
                    ($('#co-shipping-form [name^="shippingAddress"]').length > 0 && !$('[name="billing-address-same-as-shipping"]').is(':checked')) || 
                    $('#co-payment-form [name^="shippingAddress"]').length > 0 || $('#opc-new-shipping-address').is(':visible') || 
                    $('#shipping-new-address-form [name^="shippingAddress"]').length > 0){
                        shouldValidate = true;
                    }

                if(shouldValidate){
                    $('[name^="shippingAddress"]').each(function(item, index) {
                        if ($(this).hasClass('_required') && $(this).find('input').val() !== undefined) {
                            if(!$(this).find('input').val()){
                                $(this).addClass('mage-error');
                                $(this).attr('aria-invalid', 'true');

                                var parentElement = $(this);
                                var allElements = parentElement.find('.field-error');
                                allElements.remove();
                                if(!($(this).find('.mage-error').length > 0)){
                                    if(isLabel){
                                        $(this).find('input').after('<div class="field-error mage-error" ><span data-bind="text: element.error">' + $.mage.__('This is a required field.') + '</span></div>');
                                    }else{
                                        $(this).find('input').after('<div class="field-error mage-error d-none" ><span data-bind="text: element.error">' + $.mage.__('This is a required field.') + '</span></div>');
                                    }
                                }
                                isValid = false;
                            }else{
                                $(this).find('.mage-error').remove();
                            }
                            
                        }else{
                            $(this).find('.mage-error').remove();
                        }
                    });
                }


                return isValid;
            }
    
            function togglePaymentMethodVisibility(isVisible) {
                if(isVisible){
                    $('#checkout-step-payment').removeClass('disable');
                    // $('.payment-method._active .payment-method-content').removeClass('d-none');
                }else{
                    $('#checkout-step-payment').addClass('disable');
                    // $('.payment-method._active .payment-method-content').addClass('d-none');
                }
            }
    
            (function pollForForm() {
                if ($('#shipping-new-address-form [name^="shippingAddress"]').length > 0) {

                    togglePaymentMethodVisibility(validateShippingAddressForm(false));
                    $(document).on('click','.table-checkout-shipping-method tbody tr.row, #co-payment-form', function() {
                        var isValid = validateShippingAddressForm(false);
                        togglePaymentMethodVisibility(isValid);
                        $(this).find('input').removeAttr('disabled');
                    });
                    
                    $(document).on('click','#checkout-step-payment.disable',function () {
                        setTimeout(function(){
                            if($('#checkout-step-payment.disable').length > 0){
                                $('html, body').animate({ scrollTop: 0 }, 'slow');
                                return false;
                            }
                        },100)
                    });

                    $(function(){
                        var interval = setInterval(function(){
                            if($('[name^="shippingAddress"]').length > 0){
                                $('[name^="shippingAddress"]').each(function(item, index) {
                                    if ($(this).hasClass('_required') && $(this).find('input').val() !== undefined) {
                                        $($(this).find('input')).on('keyup',function(){ 
                                            var isValid = validateShippingAddressForm(false);
                                            togglePaymentMethodVisibility(isValid);
                                        })
                                    }
                                })
                                clearInterval(interval);
                            }
                        },100);
                    })
                } else {
                    setTimeout(pollForForm, 25);
                }
            })();

            // This is for the checkbox "Billing address same as delivery address"
            (function pollForModal(){
                if($("#opc-new-shipping-address").closest('.modal-inner-wrap').find('.modal-title').length > 0){
                    $("#opc-new-shipping-address").closest('.modal-inner-wrap').find('.modal-title').text("Add New Delivery Address");

                    $(document).on('click','.modals-wrapper #shipping-new-address-form .field.choice', function(){
                        if($('.modals-wrapper #shipping-new-address-form #shipping-save-in-address-book').is(':checked')){
                            $(this).addClass('checked');
                        }else{
                            $(this).removeClass('checked');
                        }
                    })

                }else{
                    setTimeout(pollForModal, 100);
                }
            })();

            // for the modals specific design adding class checkout_address
            $(document).on('click',"#checkout-step-shipping > button, .edit-address-link", function(){
                $('body').addClass('checkout_address');
            });

            $(document).on('click','.checkout_address .modals-overlay, .checkout_address .modal-footer .action.action-hide-popup, .checkout_address .modal-header .action-close',function(){
                $('body').removeClass('checkout_address');
            })

            $(document).on('click','.checkout_address .modal-footer .action.action-save-address',function(){
                var isValid = validateShippingAddressForm(true);
                if(isValid){
                    $('body').removeClass('checkout_address');
                }
            })

            $(document).on('mouseover','#checkout-step-payment.disable',function (e) {
                togglePaymentMethodVisibility(validateShippingAddressForm(true));
            })

            var deliveryMethodInterval = setInterval(function(){
                if($('#checkout-shipping-method-load .message.error').length > 0 && $('#checkout-shipping-method-load ').is(':visible')){
                    togglePaymentMethodVisibility(false);
                }
                if($('#checkout-shipping-method-load [name="shipping_method"]').attr('disabled')){
                    $('#checkout-shipping-method-load [name="shipping_method"]').removeAttr('disabled');
                }

                if($('#checkout-shipping-method-load [name="shipping_method"]').length > 0 && !$('#checkout-shipping-method-load [name="shipping_method"]:checked').length > 0 && $('#checkout-shipping-method-load [name="shipping_method"]').is(':visible')){
                    $('#checkout-shipping-method-load [name="shipping_method"]:first').attr('checked',true);
                    $('#checkout-shipping-method-load [name="shipping_method"]:first').addClass('checked');
                    $('#checkout-shipping-method-load [name="shipping_method"]:first').click();
                    console.log('checked');
                }

                if($('.shipping-address-item.selected-item').length > 0 ){
                    togglePaymentMethodVisibility(true);
                }
            },100);
         
        });
    });
    
    