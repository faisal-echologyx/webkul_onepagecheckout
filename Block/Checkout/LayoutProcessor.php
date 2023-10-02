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

namespace Webkul\OneStepCheckout\Block\Checkout;

use Magento\Checkout\Helper\Data;
use Magento\Framework\App\ObjectManager;
use Magento\Store\Model\StoreManagerInterface;

/**
 * Class LayoutProcessor checkout fields
 */
class LayoutProcessor implements \Magento\Checkout\Block\Checkout\LayoutProcessorInterface
{
    /**
     * @var \Magento\Customer\Model\AttributeMetadataDataProvider
     */
    private $_attributeMetadataDataProvider;

    /**
     * @var \Magento\Ui\Component\Form\AttributeMapper
     */
    protected $attributeMapper;

    /**
     * @var AttributeMerger
     */
    protected $merger;

    /**
     * @var \Magento\Customer\Model\Options
     */
    private $options;

    /**
     * @var Data
     */
    private $checkoutDataHelper;

    /**
     * @var StoreManagerInterface
     */
    private $storeManager;

    /**
     * @var \Magento\Shipping\Model\Config
     */
    private $shippingConfig;

    /**
     * @param \Magento\Customer\Model\AttributeMetadataDataProvider $attributeMetadataDataProvider
     * @param \Magento\Ui\Component\Form\AttributeMapper $attributeMapper
     * @param AttributeMerger $merger
     * @param \Magento\Customer\Model\Options|null $options
     * @param Data|null $checkoutDataHelper
     * @param \Magento\Shipping\Model\Config|null $shippingConfig
     * @param StoreManagerInterface|null $storeManager
     */
    public function __construct(
        \Magento\Customer\Model\AttributeMetadataDataProvider $attributeMetadataDataProvider,
        \Magento\Ui\Component\Form\AttributeMapper $attributeMapper,
        \Magento\Checkout\Block\Checkout\AttributeMerger $merger,
        \Magento\Customer\Model\Options $options = null,
        Data $checkoutDataHelper = null,
        \Magento\Shipping\Model\Config $shippingConfig = null,
        StoreManagerInterface $storeManager = null,
        \Webkul\OneStepCheckout\Helper\Data $oneStepHelepr
    ) {
        $this->_attributeMetadataDataProvider = $attributeMetadataDataProvider;
        $this->attributeMapper = $attributeMapper;
        $this->merger = $merger;
        $this->options = $options ?: \Magento\Framework\App\ObjectManager::getInstance()
            ->get(\Magento\Customer\Model\Options::class);
        $this->checkoutDataHelper = $checkoutDataHelper ?: \Magento\Framework\App\ObjectManager::getInstance()
            ->get(Data::class);
        $this->shippingConfig = $shippingConfig ?: \Magento\Framework\App\ObjectManager::getInstance()
            ->get(\Magento\Shipping\Model\Config::class);
        $this->storeManager = $storeManager ?: \Magento\Framework\App\ObjectManager::getInstance()
            ->get(StoreManagerInterface::class);
        $this->oneStepHelepr = $oneStepHelepr;
    }

    /**
     * Get address attributes.
     *
     * @return array
     */
    private function getCustomerAddressAttributes()
    {
        /** @var \Magento\Eav\Api\Data\AttributeInterface[] $attributes */
        $attributes = $this->_attributeMetadataDataProvider->loadAttributesCollection(
            'customer_address',
            'customer_register_address'
        );

        $elements = [];
        foreach ($attributes as $attribute) {
            if ($attribute->getIsUserDefined()) {
                continue;
            }
            $code = $attribute->getAttributeCode();
            $elements[$code] = $this->attributeMapper->map($attribute);
            if (isset($elements[$code]['label'])) {
                $label = $elements[$code]['label'];
                $elements[$code]['label'] = __($label);
            }
        }
        return $elements;
    }

    /**
     * Convert elements(like prefix and suffix) from inputs to selects
     *
     * @param array $elements address attributes
     * @param array $attributesToConvert fields and their callbacks
     * @return array
     */
    private function convertElementsToSelect($elements, $attributesToConvert)
    {
        $codes = array_keys($attributesToConvert);
        foreach (array_keys($elements) as $code) {
            if (!in_array($code, $codes)) {
                continue;
            }

            // phpcs:ignore Magento2.Functions.DiscouragedFunction
            $options = call_user_func($attributesToConvert[$code]);
            if (!is_array($options)) {
                continue;
            }
            $elements[$code]['formElement'] = 'select';
            $elements[$code]['dataType'] = 'select';

            foreach ($options as $key => $value) {
                $elements[$code]['options'][] = [
                    'value' => $key,
                    'label' => $value,
                ];
            }
        }

        return $elements;
    }

    /**
     * Process js Layout of block
     *
     * @param array $checkoutLayout
     * @return array
     */
    public function process($checkoutLayout)
    {
        if (!$this->oneStepHelepr->getIsEnable()) {
            return $checkoutLayout;
        }
        $attributesToConvert = [
            'prefix' => [$this->options, 'getNamePrefixOptions'],
            'suffix' => [$this->options, 'getNameSuffixOptions'],
        ];

        $elements = $this->getCustomerAddressAttributes();
        $elements = $this->convertElementsToSelect($elements, $attributesToConvert);
        // The following code is a workaround for custom address attributes
        if (isset($checkoutLayout['components']['checkout']['children']['steps']['children']['billing-step']['children']
            ['payment']['children'])) {
            $checkoutLayout['components']['checkout']['children']['steps']['children']['billing-step']['children']
            ['payment']['children'] = $this->processPaymentChildrenComponents(
                $checkoutLayout['components']['checkout']['children']['steps']['children']['billing-step']['children']
                ['payment']['children'],
                $elements
            );
        }
        if (isset($checkoutLayout['components']['checkout']['children']['steps']['children']['shipping-step']
            ['children']['step-config']['children']['shipping-rates-validation']['children'])) {
            $checkoutLayout['components']['checkout']['children']['steps']['children']['shipping-step']['children']
            ['step-config']['children']['shipping-rates-validation']['children'] =
                $this->processShippingChildrenComponents(
                    $checkoutLayout['components']['checkout']['children']['steps']['children']
                    ['shipping-step']['children']['step-config']['children']['shipping-rates-validation']['children']
                );
        }

        if (isset($checkoutLayout['components']['checkout']['children']['steps']['children']['shipping-step']
            ['children']['shippingAddress']['children']['shipping-address-fieldset']['children'])) {
            $fields = $checkoutLayout['components']['checkout']['children']['steps']['children']['shipping-step']
            ['children']['shippingAddress']['children']['shipping-address-fieldset']['children'];
            $checkoutLayout['components']['checkout']['children']['steps']['children']['shipping-step']
            ['children']['shippingAddress']['children']['shipping-address-fieldset']['children'] = $this->merger->merge(
                $elements,
                'checkoutProvider',
                'shippingAddress',
                $fields
            );
        }
        $checkoutLayout = $this->updateBillingFormFields($checkoutLayout);

        return $checkoutLayout;
    }

    /**
     * Process shipping configuration to exclude inactive carriers.
     *
     * @param array $shippingRatesLayout
     * @return array
     */
    private function processShippingChildrenComponents($shippingRatesLayout)
    {
        $activeCarriers = $this->shippingConfig->getActiveCarriers(
            $this->storeManager->getStore()->getId()
        );
        foreach (array_keys($shippingRatesLayout) as $carrierName) {
            $carrierKey = str_replace('-rates-validation', '', $carrierName);
            if (!array_key_exists($carrierKey, $activeCarriers)) {
                unset($shippingRatesLayout[$carrierName]);
            }
        }
        return $shippingRatesLayout;
    }

    /**
     * Appends billing address form component to payment layout
     *
     * @param array $paymentLayout
     * @param array $elements
     * @return array
     */
    private function processPaymentChildrenComponents(array $paymentLayout, array $elements)
    {
        if (!isset($paymentLayout['payments-list']['children'])) {
            $paymentLayout['payments-list']['children'] = [];
        }

        if (!isset($paymentLayout['afterMethods']['children'])) {
            $paymentLayout['afterMethods']['children'] = [];
        }
        $component['billing-address-form'] = $this->getBillingAddressComponent('shared', $elements);
        $paymentLayout['afterMethods']['children'] =
            array_merge_recursive(
                $component,
                $paymentLayout['afterMethods']['children']
            );

        return $paymentLayout;
    }

    /**
     * Inject billing address component into every payment component
     *
     * @param array $configuration list of payment components
     * @param array $elements attributes that must be displayed in address form
     * @return array
     */
    private function processPaymentConfiguration(array &$configuration, array $elements)
    {
        $output = [];
        foreach ($configuration as $paymentGroup => $groupConfig) {
            foreach ($groupConfig['methods'] as $paymentCode => $paymentComponent) {
                if (empty($paymentComponent['isBillingAddressRequired'])) {
                    continue;
                }
                $output[$paymentCode . '-form'] = $this->getBillingAddressComponent($paymentCode, $elements);
            }
            unset($configuration[$paymentGroup]['methods']);
        }

        return $output;
    }

    public function updateBillingFormFields($result)
    {
        if (isset($result['components']
            ['checkout']['children']['steps']['children']['billing-step']['children']
            ['payment']['children']['afterMethods']['children']
            ['billing-address-form']['children']['form-fields']['children']['gst_number'])
        ) {
            $gstField = &$result['components']
            ['checkout']['children']['steps']['children']['billing-step']['children']
            ['payment']['children']['afterMethods']['children']
            ['billing-address-form']['children']['form-fields']['children']['gst_number'];

            if (!$this->oneStepHelepr->getConfigValue('opc/general_settings/gst_enable')) {
                $gstField['visible'] = false;
                return $result;
            }

            $gstField['component'] = 'Webkul_OneStepCheckout/js/form/element/gst-number';
            $gstField['visible'] = false;
            $gstField['filterBy'] = [
                'target' => '${ $.provider }:${ $.parentScope }.country_id',
                'field' => 'country_id',
            ];
        }

        return $result;
    }

    public function getAdditionalFields($addressType = 'shipping')
    {
        $shippingAttributes = [];
        $billingAttributes = [];
        $shippingAttributes[] = 'gst_number';
        $billingAttributes[] = 'gst_number';

        return $addressType == 'shipping' ? $shippingAttributes : $billingAttributes;
    }

    /**
     * Gets billing address component details
     *
     * @param string $paymentCode
     * @param array $elements
     * @return array
     */
    private function getBillingAddressComponent($paymentCode, $elements)
    {
        return [
            'component' => 'Magento_Checkout/js/view/billing-address',
            'displayArea' => 'billing-address-form-' . $paymentCode,
            'provider' => 'checkoutProvider',
            'deps' => 'checkoutProvider',
            'dataScopePrefix' => 'billingAddress' . $paymentCode,
            'billingAddressListProvider' => '${$.name}.billingAddressList',
            'sortOrder' => 1,
            'children' => [
                'billingAddressList' => [
                    'component' => 'Magento_Checkout/js/view/billing-address/list',
                    'displayArea' => 'billing-address-list',
                    'template' => 'Magento_Checkout/billing-address/list'
                ],
                'form-fields' => [
                    'component' => 'uiComponent',
                    'displayArea' => 'additional-fieldsets',
                    'children' => $this->merger->merge(
                        $elements,
                        'checkoutProvider',
                        'billingAddress' . $paymentCode,
                        [
                            'country_id' => [
                                'sortOrder' => 115,
                            ],
                            'region' => [
                                'visible' => false,
                            ],
                            'region_id' => [
                                'component' => 'Magento_Ui/js/form/element/region',
                                'config' => [
                                    'template' => 'ui/form/field',
                                    'elementTmpl' => 'ui/form/element/select',
                                    'customEntry' => 'billingAddress' . $paymentCode . '.region',
                                ],
                                'validation' => [
                                    'required-entry' => true,
                                ],
                                'filterBy' => [
                                    'target' => '${ $.provider }:${ $.parentScope }.country_id',
                                    'field' => 'country_id',
                                ],
                            ],
                            'postcode' => [
                                'component' => 'Magento_Ui/js/form/element/post-code',
                                'validation' => [
                                    'required-entry' => true,
                                ],
                            ],
                            'company' => [
                                'validation' => [
                                    'min_text_length' => 0,
                                ],
                            ],
                            'fax' => [
                                'validation' => [
                                    'min_text_length' => 0,
                                ],
                            ],
                            'telephone' => [
                                'config' => [
                                    'tooltip' => [
                                        'description' => __('For delivery questions.'),
                                    ],
                                ],
                            ],
                        ]
                    ),
                ],
            ],
        ];
    }
}
