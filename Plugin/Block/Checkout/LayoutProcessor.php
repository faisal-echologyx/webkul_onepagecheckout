<?php
/**
 * Webkul Software.
 *
 * @category  Webkul
 * @package   Webkul_OneStepCheckout
 * @author    Webkul
 * @copyright Copyright (c) Webkul Software Private Limited (https://webkul.com)
 * @license   https://store.webkul.com/license.html
 */
namespace Webkul\OneStepCheckout\Plugin\Block\Checkout;

class LayoutProcessor
{
    /**
     * @var \Webkul\OneStepCheckout\Helper\Data
     */
    private $oscHelper;

    /**
     * @param \Webkul\OneStepCheckout\Helper\Data $oscHelper
     */
    public function __construct(
        \Webkul\OneStepCheckout\Helper\Data $oscHelper
    ) {
        $this->oscHelper = $oscHelper;
    }

    /**
     * @param \Magento\Checkout\Block\Checkout\LayoutProcessor $subject
     * @param array $jsLayout
     * @return array
     */
    public function afterProcess(
        \Magento\Checkout\Block\Checkout\LayoutProcessor $subject,
        array $jsLayout
    ) {
        if ($this->oscHelper->getIsEnable()) {
            if ($this->oscHelper->getConfigValue('opc/general_settings/gst_enable')) {
                $jsLayout['components']['checkout']['children']['steps']['children']['shipping-step']['children']
                ['shippingAddress']['children']['shipping-address-fieldset']['children']['gst_number'] = [
                    'component' => 'Webkul_OneStepCheckout/js/form/element/gst-number',
                    'config' => [
                        'customScope' => 'shippingAddress.custom_attributes',
                        'template' => 'ui/form/field',
                        'elementTmpl' => 'ui/form/element/input',
                        'options' => [],
                        'id' => 'gst-number'
                    ],
                    'filterBy' => [
                        'target' => '${ $.provider }:${ $.parentScope }.country_id',
                        'field' => 'country_id',
                    ],
                    'dataScope' => 'shippingAddress.custom_attributes.gst_number',
                    'label' => 'GST Number',
                    'provider' => 'checkoutProvider',
                    'visible' => true,
                    'validation' => [],
                    'sortOrder' => 120,
                    'id' => 'gst-number',
                    'visible' => false,
                ];
            } else {
                if (isset($jsLayout['components']['checkout']['children']['steps']['children']['shipping-step']
                    ['children']['shippingAddress']['children']
                    ['shipping-address-fieldset']['children']['gst_number'])) {
                    $jsLayout['components']['checkout']['children']['steps']['children']['shipping-step']['children']
                    ['shippingAddress']['children']['shipping-address-fieldset']['children']['gst_number']
                    ['visible'] = false;
                }
            }

            unset($jsLayout['components']['checkout']['children']['progressBar']);
            $paymentListField = &$jsLayout['components']['checkout']['children']
                ['steps']['children']['billing-step']['children']
                ['payment']['children']['payments-list']['children'];

            foreach ($paymentListField as $code => $children) {
                if ($children['component'] == 'Magento_Checkout/js/view/billing-address') {
                    unset($paymentListField[$code]);
                }
            }

        }
        return $jsLayout;
    }
}
