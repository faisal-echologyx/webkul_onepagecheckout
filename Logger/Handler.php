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
namespace Webkul\OneStepCheckout\Logger;

class Handler extends \Magento\Framework\Logger\Handler\Base
{
    /**
     * Logging level.
     * @var int
     */
    public $loggerType = Logger::INFO;

    /**
     * File name.
     * @var string
     */
    public $fileName = '/var/log/onestepcheckout.log';
}
