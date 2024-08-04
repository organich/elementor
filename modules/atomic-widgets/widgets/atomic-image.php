<?php
namespace Elementor\Modules\AtomicWidgets\Widgets;

use Elementor\Modules\AtomicWidgets\Controls\Section;
use Elementor\Modules\AtomicWidgets\Controls\Types\Select_Control;
use Elementor\Modules\AtomicWidgets\Controls\Types\Textarea_Control;
use Elementor\Modules\AtomicWidgets\Base\Atomic_Widget_Base;
use Elementor\Modules\AtomicWidgets\Schema\Atomic_Prop;
use Elementor\Utils;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Atomic_Image extends Atomic_Widget_Base {
	public function get_icon() {
		return 'eicon-image';
	}

	public function get_title() {
		return esc_html__( 'Atomic Image', 'elementor' );
	}

	public function get_name() {
		return 'a-image';
	}

	protected function render() {
		$settings = $this->get_atomic_settings();
		// TODO: Move the validation/sanitization to the props schema constraints.
		$escaped_tag = Utils::validate_html_tag( $settings['tag'] );
		// phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped
		echo "<$escaped_tag></$escaped_tag>";
	}

	public function get_atomic_controls(): array {
		$tag_control = Select_Control::bind_to( 'tag' )
			->set_label( __( 'Tag', 'elementor' ) )
			->set_options( [
				[
					'value' => 'image',
					'label' => 'H1',
				]
			]);

		$alt_control = Textarea_Control::bind_to( 'title' )
			->set_label( __( 'Title', 'elementor' ) )
			->set_placeholder( __( 'Type your title here', 'elementor' ) );

        $tag_and_alt_section = Section::make()
			->set_label( __( 'Content', 'elementor' ) )
			->set_items( [
				$tag_control,
                $alt_control,
			]);

		return [
			$tag_and_alt_section,
		];
	}

	public static function get_props_schema(): array {
		return [
			'tag' => Atomic_Prop::make()
				->default( 'img' ),
		];
	}
}
