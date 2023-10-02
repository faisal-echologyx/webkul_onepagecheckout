<?php
namespace Webkul\OneStepCheckout\Model;

use Magento\Checkout\Model\ConfigProviderInterface;

class DefaultConfigProvider implements ConfigProviderInterface
{
    /**
     * @var  \Webkul\OneStepCheckout\Helper\Data
     */
    private $helper;

    /**
     * @param \ShipperHQ\Shipper\Helper\Data $helper
     */
    public function __construct(
        \Webkul\OneStepCheckout\Helper\Data $helper
    ) {

        $this->helper = $helper;
    }

    /**
     * {@inheritdoc}
     */
    public function getConfig()
    {
        $config['opc_autocomplete'] = [
            'active'        => $this->helper->getConfigValue('opc/general_settings/autocomplete_active'),
            'api_key'  =>    $this->helper->getConfigValue('opc/general_settings/api_key'),
            'use_geolocation'  =>    $this->helper->getConfigValue('opc/general_settings/use_geolocation')
        ];
        $config['opc_general'] = [
            'amazonPay_enable' => $this->helper->getConfigValue('payment/amazon_payment_v2/active'),
            'order_comment' => $this->helper->getConfigValue('opc/general_settings/order_comment'),
            'order_comment_label' => $this->helper->getConfigValue('opc/general_settings/order_comment_label'),
            'is_block_collapsible' => $this->helper->getConfigValue('opc/general_settings/is_collapsible'),
        ];
        return $config;
    }
}
