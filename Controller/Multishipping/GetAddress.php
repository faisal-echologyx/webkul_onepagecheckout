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

namespace Webkul\OneStepCheckout\Controller\Multishipping;

use Magento\Framework\App\Action\Action;
use Magento\Framework\App\Action\Context;

class GetAddress extends Action
{
    /**
     * @var Magento\Framework\App\Helper\Context
     */
    private $context;

    public function __construct(
        Context $context,
        \Magento\Customer\Model\AddressFactory $addressFactory,
        \Magento\Framework\Controller\Result\JsonFactory $jsonResultFactory,
        \Magento\Customer\Helper\Address $addresssHelper,
        \Magento\Directory\Model\CountryFactory $countryFactory
    ) {
        $this->addressFactory = $addressFactory;
        $this->jsonResultFactory = $jsonResultFactory;
        $this->addresssHelper = $addresssHelper;
        $this->countryFactory = $countryFactory;
        parent::__construct($context);
    }

    public function execute()
    {
        try {
            $addId = $this->getRequest()->getParam('address_id');
            if ($addId!=null) {
                $selectedAddress = $this->addressFactory->create()->load($addId);
                $result = $this->jsonResultFactory->create();
                $streetLines = $this->getStreetDetails($selectedAddress);
                if ($selectedAddress != null) {
                    $addresArray = $selectedAddress->getData();
                    $addresArray["street_lines"] = $streetLines;
                    $addressArray["country_id"] = $selectedAddress->getCountryId();
                    $result->setData($addresArray);
                    return $result;
                } else {
                    return $result->setData([
                        "success" => false
                    ]);
                }
            }
        } catch (\Exception $e) {
            return $e->getMessage();
        }
    }

    private function getStreetDetails($selectedAddress)
    {
        $addressLines = [];
        $addressLines[0] = $selectedAddress->getStreetLine(1);
        for ($_i = 1, $_n = $this->addresssHelper->getStreetLines(); $_i < $_n; $_i++) {
            $addressLines[] = $selectedAddress->getStreetLine($_i + 1);
        }
         return $addressLines;
    }
}
