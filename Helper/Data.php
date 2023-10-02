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

namespace Webkul\OneStepCheckout\Helper;

/**
 * OneStepCheckout data helper
 */
class Data extends \Magento\Framework\App\Helper\AbstractHelper
{
    /**
     * @var Magento\Framework\App\Helper\Context
     */
    private $context;

    /**
     * @var Magento\Store\Model\StoreManagerInterface
     */
    private $storeManager;

    /**
     * @var \Magento\Framework\Module\Manager
     */
    private $moduleManager;

    /**
     * @var \Magento\Payment\Model\Config
     */
    private $paymentConfig;

    /**
     * @var RequestInterface
     */
    private $request;

    /**
     * @param Magento\Framework\App\Helper\Context $context
     * @param Magento\Store\Model\StoreManagerInterface $storeManager
     * @param \Magento\Framework\Module\Manager $moduleManager
     * @param \Magento\Payment\Model\Config $paymentConfig
     * @param \Magento\Framework\App\RequestInterface $request,
     */
    public function __construct(
        \Magento\Framework\App\Helper\Context $context,
        \Magento\Store\Model\StoreManagerInterface $storeManager,
        \Magento\Framework\Module\Manager $moduleManager,
        \Magento\Payment\Model\Config $paymentConfig,
        \Magento\Framework\App\RequestInterface $request
    ) {
        parent::__construct($context);
        $this->storeManager = $storeManager;
        $this->moduleManager = $moduleManager;
        $this->paymentConfig = $paymentConfig;
        $this->request = $request;
    }

    /**
     * function to get Config Data.
     * @return string
     */
    public function getConfigValue($field = false)
    {
        if ($field) {
            return $this->scopeConfig
                    ->getValue(
                        $field,
                        \Magento\Store\Model\ScopeInterface::SCOPE_STORE,
                        $this->getStoreId()
                    );
        } else {
            return;
        }
    }

    /**
     * funtion to check osc enable.
     * @return boolean
     */
    public function getIsEnable()
    {
        return $this->getConfigValue('opc/general_settings/active');
    }

    public function getIsMultiShippingEnable()
    {
        return false;
    }

    /**
     * funtion to get layout.
     * @return string
     */
    public function getLayoutType()
    {
        $layout = $this->getConfigValue('opc/general_settings/layout').'.html';
        return 'Webkul_OneStepCheckout/'.$layout;
    }

    /**
     * funtion to return store id.
     * @return int
     */
    public function getStoreId()
    {
        return $this->storeManager->getStore()->getId();
    }

    /**
     * funtion to return checkout url.
     * @return string
     */
    public function getOneStepCheckoutUrl()
    {
        return $this->_urlBuilder->getUrl(
            'onestepcheckout/index/index',
            ['_secure' => true]
        );
    }

    /**
     * funtion to return active modules.
     * @return array
     */
    public function isActiveModule()
    {
        $comModuleArr = [
            "Webkul_SellerStorePickup",
            "Webkul_Multishipping"
        ];
        $activeModuleArr = [];
        foreach ($comModuleArr as $module) {
            if ($this->moduleManager->isOutputEnabled($module)) {
                $activeModuleArr[$module] = 1;
            } else {
                $activeModuleArr[$module] = 0;
            }
        }

        return $activeModuleArr;
    }

    /**
     * funtion to return active payment.
     * @return array
     */
    public function getActivePaymentMethod()
    {
        $payments = $this->paymentConfig->getActiveMethods();
        $methods = [];
        foreach ($payments as $paymentCode => $paymentModel) {
            if ($paymentCode!="free" || $paymentCode!="paypal_billing_agreement") {
                $paymentTitle = $this->scopeConfig
                    ->getValue('payment/'.$paymentCode.'/title');
                $methods[$paymentCode] = 1;
            }
        }
        return $methods;
    }
}
