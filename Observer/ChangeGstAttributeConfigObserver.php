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
namespace Webkul\OneStepCheckout\Observer;

use Magento\Framework\Event\Observer as EventObserver;
use Magento\Framework\Event\ObserverInterface;
use Magento\Customer\Model\Indexer\Address\AttributeProvider;

/**
 * Observer is responsible for changing customer attribute gst_number visibility
 */
class ChangeGstAttributeConfigObserver implements ObserverInterface
{
    /**
     * @var \Webkul\OneStepCheckout\Helper\Data
     */
    private $helper;
    
    /**
     * @var \Magento\Eav\Model\ResourceModel\Entity\Attribute
     */
    private $eavAttribute;

    /**
     * @var \Webkul\OneStepCheckout\Logger\Logger
     */
    private $oscLogger;

    /**
     * @param \Webkul\OneStepCheckout\Helper\Data $helper
     * @param \Magento\Eav\Model\ResourceModel\Entity\Attribute $eavAttribute
     * @param \Webkul\OneStepCheckout\Logger\Logger $oscLogger
     */
    public function __construct(
        \Webkul\OneStepCheckout\Helper\Data $helper,
        \Magento\Eav\Model\ResourceModel\Entity\Attribute $eavAttribute,
        \Magento\Eav\Model\Config $eavConfigModel,
        \Magento\Framework\App\ResourceConnection $resource,
        \Webkul\OneStepCheckout\Logger\Logger $oscLogger
    ) {
        $this->helper = $helper;
        $this->eavAttribute = $eavAttribute;
        $this->eavConfigModel = $eavConfigModel;
        $this->resource = $resource;
        $this->oscLogger = $oscLogger;
    }

    public function execute(EventObserver $observer)
    {
        try {
            $isEnable = $this->helper->getIsEnable();
            $entityTypeId = $this->eavConfigModel
                ->getEntityType(AttributeProvider::ENTITY)
                ->getEntityTypeId();
            $attributeId = $this->eavAttribute->getIdByCode(AttributeProvider::ENTITY, 'gst_number');
            if ($isEnable) {
                $isGstEnable = $this->helper->getConfigValue('opc/general_settings/gst_enable');
                if ($isGstEnable) {
                    # enable gst_number attribute
                    $connection  = $this->resource->getConnection();
                    $values = ["is_visible"=>1];
                    $condition = ['attribute_id = ?' => (int)$attributeId];
                    $customerEavAttributeTable = $connection->getTableName("customer_eav_attribute");
                    $connection->update($customerEavAttributeTable, $values, $condition);
                } else {
                    # disable gst_number attribute
                    $connection  = $this->resource->getConnection();
                    $values = ["is_visible" => 0];
                    $condition = ['attribute_id=?' => (int)$attributeId];
                    $customerEavAttributeTable = $connection->getTableName("customer_eav_attribute");
                    $connection->update($customerEavAttributeTable, $values, $condition);
                }
            } else {
                # disable gst_number attribute
                $connection  = $this->resource->getConnection();
                $values = ["is_visible" => 0];
                $condition = ['attribute_id=?' => (int)$attributeId];
                $customerEavAttributeTable = $connection->getTableName("customer_eav_attribute");
                $connection->update($customerEavAttributeTable, $values, $condition);
            }
        } catch (\Exception $e) {
            $this->oscLogger->info("ChangeGstAttributeConfigObserver -> ".$e->getMessage());
        }
    }
}
