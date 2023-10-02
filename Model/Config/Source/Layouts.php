<?php
namespace Webkul\OneStepCheckout\Model\Config\Source;

class Layouts implements \Magento\Framework\Option\ArrayInterface
{
    /**
     * Options getter
     *
     * @return array
     */
    public function toOptionArray()
    {
        return [
            ['value' => '3column-layout', 'label' => __('3Columns Layout')],
            ['value' => '2column-layout', 'label' => __('2Columns Layout')]
        ];
    }

    /**
     * Get options in "key-value" format
     *
     * @return array
     */
    public function toArray()
    {
        return ['3column-layout' => __('3Columns Layout'), '2column-layout' => __('2Columns Layout')];
    }
}
